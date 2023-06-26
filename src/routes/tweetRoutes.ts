import { PrismaClient, User } from "@prisma/client";
import { Request, Response, Router } from "express";
import { type } from "os";

const router = Router();
const prisma = new PrismaClient();

// extend Request type to include user
type AuthRequest = Request & { user?: User };

// Tweet CRUD
// create a new tweet
router.post("/", async (req: AuthRequest, res: Response) => {
    const { content, image } = req.body;
    const user = req.user;

    if (!user) {
        res.status(401).json({ message: "Not authorized" });
        return;
    }

    try {
        const data = await prisma.tweet.create({
            data: {
                content,
                image,
                userId: user.id,
            },
            include: {
                user: true,
            },
        });
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

// list all tweets
router.get("/", async (req, res) => {
    const allTweets = await prisma.tweet.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    // console.log(allTweets);
    if (allTweets.length > 0) {
        res.send(allTweets);
    } else {
        res.status(200).json({ message: "No tweets found" });
    }
});

// get one tweet by id
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const tweet = await prisma.tweet.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                user: true,
            },
        });

        // is tweet is not found
        if (!tweet) return res.status(404).json({ message: "Tweet not found" });

        // if tweet is found
        res.json(tweet);
    } catch (e) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

// delete one tweet by id
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.tweet.delete({
            where: {
                id: Number(id),
            },
        });
        res.sendStatus(200);
    } catch (e) {
        res.status(500).json({ message: "No such tweet found!" });
    }
});

export default router;
