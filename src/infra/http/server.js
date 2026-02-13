import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { registerRoutes } from './routes.js';
import { errorHandler } from '../../shared/middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

registerRoutes(app);

app.use(errorHandler);

export default app;