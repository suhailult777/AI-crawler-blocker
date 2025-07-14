import { Router } from "express";

import authorize from "../middleware/auth.middleware.js";
import { getUser, getUsers } from "../controllers/user.controller.js";

const userRouter = Router();

// GET /users -> get all users which is static parameters will look like this Eg: userRouter.get('/users', (req, res) => res.send({ title: 'Get all users' }));
// GET /users/:id -> get user by id // 123 412 this dynamic parameter


userRouter.get('/', getUsers);

userRouter.get('/:id', authorize, getUser);

userRouter.post('/', (req, res) => res.send({ title: 'CREATE new user' }));

userRouter.put('/:id', (req, res) => res.send({ title: 'Update user' })); //use for update

userRouter.delete('/:id', (req, res) => res.send({ title: 'DELETE user' }));

export default userRouter;
