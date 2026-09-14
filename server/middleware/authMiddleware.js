const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {       //Middleware function to check for the presence of a JWT token in the request headers.
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    const token = authHeader.split(" ")[1];     //Extract the actual JWT.

    if (!token) {
        return res.status(401).json({
            message: "Invalid authorization header"
        });
    }

try {       //Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
} catch (error) {
    return res.status(401).json({
        message: "Invalid or expired token"
    });
}
};

module.exports = authMiddleware;