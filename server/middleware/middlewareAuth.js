import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    try{
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {   
            return res.status(401).json({ message: "Not signed in yet" });
        }
        //get the user id from the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        // go to controller
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" })
        }
};
