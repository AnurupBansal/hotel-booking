const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "default-dev-secret-change-me";

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function generateToken(admin) {
  return jwt.sign(
    { id: admin.id, username: admin.username, name: admin.name },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

module.exports = { authMiddleware, generateToken, JWT_SECRET };
