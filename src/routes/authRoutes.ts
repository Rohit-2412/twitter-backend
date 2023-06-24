import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();
const EXPIRATION_TIME_MINUTES = 10;
const EXPIRATION_TIME_HOURS = 12;
const JWT_SECRET = "secret";

// generate a random email token of 6 digits
function generateEmailToken() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// generate auth token
function generateAuthToken(tokenId: number): string {
    const jwtPayload = tokenId.toString();

    return jwt.sign(jwtPayload, JWT_SECRET, {
        algorithm: "HS256",
    });
}

// create a user if not exists
// generate an email token and send it to the user
router.get("/login", async (req, res) => {
    const { email } = req.body;

    // generate a random token
    const emailToken = generateEmailToken();

    const expiration = new Date(
        new Date().getTime() + EXPIRATION_TIME_MINUTES * 60000
    );

    try {
        // create a token in the database
        const token = await prisma.token.create({
            data: {
                type: "EMAIL",
                expiration,
                emailToken,
                user: {
                    connectOrCreate: {
                        where: {
                            email,
                        },
                        create: {
                            email,
                        },
                    },
                },
            },
        });
        console.log(token);
        res.json({ token });
    } catch (e) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

// validate the email token
// generate a jwt token and send it to the user
router.post("/authenticate", async (req, res) => {
    const { email, emailToken } = req.body;

    const dbEmailToken = await prisma.token.findUnique({
        where: {
            emailToken,
        },
        include: {
            user: true,
        },
    });

    if (!dbEmailToken || !dbEmailToken.isValid) {
        return res.status(401).json({ message: "Unauthorized access" });
    }

    // check for valid email token
    if (dbEmailToken.expiration < new Date()) {
        return res.status(401).json({ message: "Token expired" });
    }

    if (dbEmailToken.user.email !== email) {
        return res.sendStatus(401);
    }

    // create an API token

    const apiExpiration = new Date(
        new Date().getTime() + EXPIRATION_TIME_HOURS * 3600000
    );
    const apiToken = await prisma.token.create({
        data: {
            type: "API",
            expiration: apiExpiration,
            user: {
                connect: {
                    id: dbEmailToken.user.id,
                },
            },
        },
    });

    // invalidate the email token
    await prisma.token.update({
        where: {
            id: dbEmailToken.id,
        },
        data: {
            isValid: false,
        },
    });

    // generate a jwt token
    const authToken = generateAuthToken(apiToken.id);
    res.json({ token: authToken });
});
export default router;
