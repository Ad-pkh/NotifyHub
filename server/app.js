
import express from 'express';
import cors from 'cors';
import registerRoutes from './src/app.routes.js';
import { errorHandler } from './src/middleware/error.middleware.js';
import AppError from './src/lib/AppError.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

registerRoutes(app);

app.use((req, res, next) => {
  next(new AppError('route not defined', 404));
});

app.use(errorHandler);

export default app;
