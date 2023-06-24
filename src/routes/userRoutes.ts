import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

// User CRUD

// create a new user
router.post("/", async (req, res) => {
    const { email, name, username, bio } = req.body;
    try {
        const data = await prisma.user.create({
            data: {
                email,
                name,
                username,
                bio: bio || "I'm a new user",
            },
        });
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "email and username should be unique" });
    }
});

// list all users
router.get("/", async (req, res) => {
    const allUsers = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            image: true,
        },
    });
    res.json(allUsers);
});

// get one user by id
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            tweets: true,
        },
    });

    // is user is not found
    if (!user) return res.status(404).json({ message: "User not found" });

    // if user is found
    res.json(user);
});

// update one user by id
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, bio, image } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: Number(id),
            },
            data: {
                name,
                bio,
                image,
            },
        });
        res.json(updatedUser);
    } catch (e) {
        res.status(500).json({ message: "Failed to update the user" });
    }
});

// delete one user by id
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({
            where: {
                id: Number(id),
            },
        });
        res.sendStatus(200);
    } catch (e) {
        res.status(500).json({ message: "User doesn't exist" });
    }
});

export default router;
