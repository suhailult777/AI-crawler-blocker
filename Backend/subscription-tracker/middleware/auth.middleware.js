import { JWT_SECRET } from "../config/env.js";
import jwt from 'jsonwebtoken'
import User from "../models/user.model.js";

// someone is making a request get user details -> authorize middle -> verify token -> get user details -> next -> if valid -> get user details


const authorize = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        const decoded = jwt.verify(token, JWT_SECRET)

        const user = await User.findById(decoded.userId);

        req.user = user;

        next();

    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
}

export default authorize;