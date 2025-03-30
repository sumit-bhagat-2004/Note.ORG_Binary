import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/db.js";
// import userRoutes from "./routes/user.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import walletRoutes from "./routes/wallet.routes.js";

dotenv.config();
const PORT = process.env.PORT || 8000;

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// app.use("/api/users", userRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/wallet", walletRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
