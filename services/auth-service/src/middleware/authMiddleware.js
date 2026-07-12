const jwt = require("jsonwebtoken");

const authenticate = (req,res,next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization header missing"
        });

    }

    const token = authHeader.split(" ")[1];

    if(!token) {
        return res.status(401).json({
            success: false,
            message: "Token missing"

        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();


    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};


module.exports = {
    authenticate
};