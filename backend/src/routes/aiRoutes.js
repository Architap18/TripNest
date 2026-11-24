const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    // continue as unauthenticated guest
  }
  next();
};

const { chatWithAI } = require("../controllers/aiController");

router.post("/chat", optionalAuth, chatWithAI);

module.exports = router;
