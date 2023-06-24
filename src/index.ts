import authRoutes from "./routes/authRoutes";
import express from "express";
import tweetRoutes from "./routes/tweetRoutes";
import userRoutes from "./routes/userRoutes";
import { authenticateToken } from "./middleware/authMiddleware";

const app = express();

app.use(express.json());
app.use("/user", authenticateToken, userRoutes);
app.use("/tweet", authenticateToken, tweetRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
