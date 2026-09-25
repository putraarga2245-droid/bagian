const express = require("express");
const connectToMongoDB = require("../DB/db");

const app = express();
app.use(express.json());

connectToMongoDB();

app.get("/api/hello", (req, res) => {
  res.status(200).json({ message: "API is working" });
});

module.exports = (req, res) => {
  app(req, res);
};
