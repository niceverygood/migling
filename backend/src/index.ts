import './config/environment'; // Load environment config first
import express from 'express';
import cors from 'cors';
import path from 'path';
import config from './config/environment';
import './openai'; // Initialize OpenAI client
import './db'; // Initialize Database connection
import characterRoutes from './routes/character';
import chatRouter from './routes/chat';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import personaRouter from './routes/persona';
import uploadRouter from './routes/upload';

const app = express();
const PORT = config.PORT;

/**
 * CORS Configuration - Environment based
 * 개발: localhost 허용
 * 운영: 특정 도메인만 허용
 */
const corsOrigin = config.NODE_ENV === 'production' 
  ? [
      'https://mingling.vercel.app', 
      'https://mingling-*.vercel.app',
      'https://mingling-hjlzrzm13-malshues-projects.vercel.app',
      'https://mingling-pk6lb4itb-malshues-projects.vercel.app',
      'https://mingling-4pcqme98v-malshues-projects.vercel.app',
      'https://*.vercel.app'
    ]
  : [config.CLIENT_ORIGIN, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3004'];

app.use(cors({
  origin: corsOrigin,
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

// Static file serving for uploaded images - 절대 경로로 변경
const uploadsPath = path.resolve(__dirname, '../uploads');
console.log(`📁 Static files serving from: ${uploadsPath}`);

// uploads 디렉토리 존재 확인 및 생성
import fs from 'fs';
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadsPath}`);
}

app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, path) => {
    // 이미지 파일에 대한 CORS 헤더 설정
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, max-age=31536000'
    });
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRouter);        // Health check with DB status
app.use('/api/auth', authRouter);            // Firebase authentication
app.use('/api/characters', characterRoutes); // Character management
app.use('/api/personas', personaRouter);     // Persona management
app.use('/api/chat', chatRouter);            // Chat functionality
app.use('/api/upload', uploadRouter);        // File upload functionality

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Mingling Backend API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/health - Health check with database status',
      'POST /api/auth/firebase - Firebase authentication',
      'GET /api/auth/me - Get current user info',
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
  console.log('🚀 Mingling Backend Server started');
  console.log(`📍 Port: ${PORT}`);
  console.log(`💾 Environment: ${config.NODE_ENV}`);
  console.log(`🗄️  Database: ${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`);
  console.log(`🌐 CORS Origins: ${corsOrigin}`);
  console.log(`🔐 JWT Secret: ${config.JWT_SECRET?.substring(0, 10)}...`);
  console.log(`📅 Deployed: ${new Date().toISOString()}`);
  console.log(`🔧 GitHub Actions Deploy: Ready!`);
  console.log(`🔑 GitHub Secrets: Configured!`);
  console.log(`✅ All Systems Ready - Deployment Success!`);
  console.log('⚡ Ready to accept connections!');
}); 