import { PrismaClient, User } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = "secret";

import { Request, Response, NextFunction } from "express";

type AuthRequest = Request & { user?: User };

export async function authenticateToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    // authentication
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Not authorized" });

    // fetch token from header
    const jtwToken = authHeader.split(" ")[1];

    try {
        // decode jwt token
        const payload = jwt.verify(jtwToken, JWT_SECRET);

        const dbToken = await prisma.token.findUnique({
            where: {
                id: Number(payload),
            },
            include: {
                user: true,
            },
        });

        // check if token is valid or
        // check if token is expired
        if (!dbToken || !dbToken.isValid || dbToken.expiration < new Date()) {
            return res.status(401).json({ message: "API token invalid" });
        }

        req.user = dbToken.user;
    } catch (e) {
        res.sendStatus(401);
    }

    // call next middleware
    next();
}
