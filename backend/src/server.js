import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import habitsRouter from './routes/habits.js';
import daysRouter from './routes/days.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'HabitFlow API running' });
});

app.use('/api/auth', authRouter);
app.use('/api/habits', authMiddleware, habitsRouter);
app.use('/api', authMiddleware, daysRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

