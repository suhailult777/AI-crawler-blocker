import express from 'express';
import cors from 'cors';
import { PORT } from './config/env.js';
import cookieParser from 'cookie-parser';

import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import connectToDatabase from './database/mongodb.js';
import errorMiddleware from './middleware/error.middleware.js';
import arcjetMiddleware from './middleware/arcjet.middleware.js';
import workflowRouter from './routes/workflow.routes.js';





const app = express();

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(arcjetMiddleware);

app.use('/api/v1/auth', authRouter); // we are using use for middleware
app.use('/api/v1/users', userRouter); // we are using use for middleware
app.use('/api/v1/subscriptions', subscriptionRouter); // we are using use for middleware
app.use('/api/v1/workflows', workflowRouter); // we are using use for middleware

app.use(errorMiddleware);


app.get('/', (req, res) => {
    res.send('welcome to the subscription tracker api');
})  //path, callback function

app.listen(PORT, async () => {

    console.log(`Subscription Tracker API is running on http://localhost:${PORT}`);

    await connectToDatabase()

})

export default app;