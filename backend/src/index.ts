import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import userRoutes from './routes/users';
import commentRoutes from './routes/comments';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
]
  .filter(Boolean)
  .map(url => (url as string).replace(/\/+$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/+$/, '');
    const isAllowed =
      allowedOrigins.some(o => cleanOrigin === o || cleanOrigin.startsWith(o)) ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive fallback to prevent CORS blocks in production
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

connectDB();

app.get('/', (_req, res) => {
  res.json({ message: 'Blog App API is running', status: 'OK' });
});

app.get('/api', (_req, res) => {
  res.json({ message: 'Blog App API is running', status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);

app.listen(Number(PORT), '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
export default app;
