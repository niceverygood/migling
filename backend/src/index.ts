import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import './openai'; // Initialize OpenAI client
import './db'; // Initialize Database connection
import characterRoutes from './routes/character';
import chatRouter from './routes/chat';
import healthRouter from './routes/health';

const app = express();
const PORT = process.env.PORT || 3001;

/**
 * CORS Configuration for Production Deployment
 * 
 * EC2 배포 시 유의사항:
 * - origin: '*' 허용으로 설정하여 프론트엔드 도메인 제한 없음
 * - credentials: true로 설정하여 쿠키/인증 헤더 허용
 * - Access-Control-Allow-Origin, Access-Control-Allow-Headers 등 포함
 */
app.use(cors({
  origin: '*', // 모든 origin 허용 (프로덕션에서는 특정 도메인으로 제한 권장)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRouter);        // Health check with DB status
app.use('/api/characters', characterRoutes); // Character management
app.use('/api/chat', chatRouter);            // Chat functionality

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Mingling Backend API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/health - Health check with database status',
      'GET /api/characters - Character management',
      'POST /api/chat - Chat functionality'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mingling Backend Server started`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 CORS: All origins allowed with credentials`);
  console.log(`🐬 Database: AWS RDS Aurora MySQL`);
  console.log(`💾 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Ready to accept connections!`);
}); 