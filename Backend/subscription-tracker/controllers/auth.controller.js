
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

// What is the request body? -> req.body is an object containing data from the client (POST request)

export const signUp = async (req, res, next) => {
    try {
        // create a new user
        const { name, email, password } = req.body;

        // check if a user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        //Hash password
        const salt = await bcrypt.genSalt(10);//salt is the complexity you use for randomizing the password
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword });
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: newUser,
            }
        });//201 is created status code.

    } catch (error) {
        next(error);
    }
}

export const signIn = async (req, res, next) => {

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }); //filter

        if (!user) {
            const error = new Error('User not Found');
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error('Invalid password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({
            success: true,
            message: 'User signed in successfully',
            data: {
                token,
                user,
            }
        });
    } catch (error) {
        next(error);
    }

}

export const signOut = async (req, res, next) => {
}
