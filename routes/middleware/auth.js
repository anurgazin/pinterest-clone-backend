const jwt = require("jsonwebtoken");

// Authentication middleware function
const authenticate = (req, res, next) => {
  // Extract the JWT token from the request headers
  const token = req.headers.authorization;

  // Check if the token is present
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the decoded user information to the request object
    req.user = { user_id: decoded.user_id, username: decoded.username };
    // Move to the next middleware or route handler
    next();
  } catch (error) {
    // If the token is invalid or expired, return an error response
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = authenticate;
