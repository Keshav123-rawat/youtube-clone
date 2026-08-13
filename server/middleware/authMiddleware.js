// import jwt from "jsonwebtoken";

// const authMiddleware = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//       return res.status(401).json({
//         message: "Access Denied. No Token Provided.",
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     const verified = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = verified;

//     next();
//   } catch (error) {
//     res.status(401).json({
//       message: "Invalid Token",
//     });
//   }
// };

// export default authMiddleware;

// NEW
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Access Denied. No Token Provided.",
      });
    }

    // Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Access Denied. No Token Provided.",
      });
    }

    // Verify JWT
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user information
    req.user = verified;

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
