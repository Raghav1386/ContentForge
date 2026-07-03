import "dotenv/config";
import express from "express";
import cors from "cors";
import generateRoute from "./routes/generate.js";



const app = express();

app.use(cors());

app.use(express.json({
  limit: "10mb"
}));

app.use("/generate", generateRoute);

app.get("/", (req, res) => {
  res.json({
    message: "ContentForge API Running"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});