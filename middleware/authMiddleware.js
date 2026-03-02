const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // 1. Get token from the Header
  const token = req.header('Authorization')?.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Add user data to the request object
    req.user = decoded;
    next(); // Move to the next function (the actual route)
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = protect;