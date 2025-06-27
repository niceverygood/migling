import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import './openai'; // Initialize OpenAI client
import characterRoutes from './routes/character';
import chatRoutes from './routes/chat';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/characters', characterRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').join(', ') : 'http://localhost:5173'}`);
}); 