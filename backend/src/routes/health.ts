import { Router } from 'express';
import { getConnectionStatus } from '../db';

const router = Router();

/**
 * Health Check Endpoint with Database Connection Status
 * GET /api/health
 * 
 * Returns:
 * - Overall status
 * - Database connection status
 * - Timestamp
 * - Database connection details
 */
router.get('/', async (req, res) => {
  try {
    // DB 연결 상태 확인
    const dbStatus = await getConnectionStatus();
    
    // 전체 상태 결정
    const overallStatus = dbStatus.status === 'connected' ? 'ok' : 'degraded';
    
    const response = {
      status: overallStatus,
      db: dbStatus.status === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      database: {
        host: dbStatus.poolConfig.host,
        database: dbStatus.poolConfig.database,
        connectionLimit: dbStatus.poolConfig.connectionLimit,
        ...(dbStatus.status === 'connected' ? {
          connectionId: dbStatus.connectionId,
          currentTime: dbStatus.currentTime,
          threadsConnected: dbStatus.threadsConnected
        } : {
          error: dbStatus.error
        })
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        environment: process.env.NODE_ENV || 'development'
      }
    };

    // DB 연결 실패시 503 상태 코드 반환
    const statusCode = dbStatus.status === 'connected' ? 200 : 503;
    
    res.status(statusCode).json(response);
  } catch (error) {
    // 예외 발생시 500 에러 반환
    res.status(500).json({
      status: 'error',
      db: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  }
});

export default router; 