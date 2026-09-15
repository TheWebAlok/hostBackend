const jwt = require("jsonwebtoken");

// ============================================
// PROTECT
// ============================================

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token not found.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Keep complete decoded token
    req.user = decoded;

    // Make sure _id is available for controllers
    if (!req.user._id && req.user.id) {
      req.user._id = req.user.id;
    }

    if (!req.user._id && req.user.userId) {
      req.user._id = req.user.userId;
    }

    next();
  } catch (error) {
    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};


// ============================================
// AUTHORIZE
// ============================================

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permission.",
      });
    }

    next();
  };
};


// ============================================
// EXPORT
// ============================================

module.exports = {
  protect,
  authorize,
};