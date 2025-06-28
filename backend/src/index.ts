import './config/environment'; // Load environment config first
import express from 'express';
import cors from 'cors';
import config from './config/environment';
import './openai'; // Initialize OpenAI client
import './db'; // Initialize Database connection
import characterRoutes from './routes/character';
import chatRouter from './routes/chat';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import personaRouter from './routes/persona';

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
      'https://mingling-2vehp37lc-malshues-projects.vercel.app',
      'https://*.vercel.app'
    ]
  : [config.CLIENT_ORIGIN, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

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
  console.log(`\n🚀 Mingling Backend Server started`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`💾 Environment: ${config.NODE_ENV}`);
  console.log(`🗄️  Database: ${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`);
  console.log(`🌐 CORS Origins: ${corsOrigin}`);
  console.log(`🔐 JWT Secret: ${config.JWT_SECRET?.substring(0, 10)}...`);
  console.log(`⚡ Ready to accept connections!\n`);
}); 