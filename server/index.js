// index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const external = require("./routes/externalQuestions.js");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/external-questions", external);

// 1) Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// 2) Define your Question schema/model
const questionSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  choices: { type: [String], required: true },
  correct: { type: String, required: true },
  turnOrder: { type: Number, default: 0 },
});
const Question = mongoose.model("Question", questionSchema);

// 3) CRUD endpoints
app.get("/api/questions", async (req, res) => {
  try {
    const qs = await Question.find().sort("turnOrder");
    res.json(qs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/questions", async (req, res) => {
  try {
    const q = new Question(req.body);
    await q.save();
    res.status(201).json(q);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// …you can add PUT/DELETE later

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
