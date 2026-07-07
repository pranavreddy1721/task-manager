const jwt = require("jsonwebtoken");
const User = require("../models/User");

// This middleware checks the incoming request for a valid JWT token.
// If valid, it attaches the logged-in user to req.user and lets the request continue.
// If invalid/missing, it blocks the request with a 401 Unauthorized.
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  // Standard convention: token is sent as "Bearer <token>" in the Authorization header
  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      token = authHeader.split(" ")[1];

      // Verify token signature & expiry using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB (excluding password) and attach to request object
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found, token invalid" });
      }

      next(); // token valid, proceed to the actual route handler
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed or expired" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
