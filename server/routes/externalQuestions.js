// server/routes/externalQuestions.js
const express = require("express");

// Node.js v18+ includes a global fetch API, so no need for node-fetch
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const amount = req.query.amount || 5;
    const url = `https://opentdb.com/api.php?amount=${amount}&category=15&type=multiple`;
    const response = await fetch(url);
    if (!response.ok) {
      return res
        .status(response.status)
        .send(`Upstream error: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data.results);
  } catch (err) {
    console.error("External fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
