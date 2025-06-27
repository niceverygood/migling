import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * AWS RDS Aurora MySQL Connection Pool Configuration
 * 
 * EC2 배포 시 유의사항:
 * 1. EC2 Security Group에서 3306 포트 허용 필요
 * 2. RDS Security Group에서 EC2 접근 허용 필요  
 * 3. VPC 설정 확인 (같은 VPC 또는 적절한 라우팅)
 * 4. RDS가 Public Access 허용으로 설정되어 있어야 함 (또는 VPC 내부 접근)
 * 5. SSL/TLS 연결 설정 권장 (프로덕션 환경)
 */

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Connection Pool Settings
  connectionLimit: 5,              // 최대 연결 수
  queueLimit: 0,                   // 대기열 제한 없음
  acquireTimeout: 10000,           // 연결 획득 타임아웃 (10초)
  timeout: 10000,                  // 쿼리 타임아웃 (10초)
  // SSL Configuration (프로덕션 권장)
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false    // AWS RDS 인증서 검증 스킵 (필요시 수정)
    }
  }),
  // Character Set
  charset: 'utf8mb4',
  // Timezone 설정
  timezone: '+00:00'
};

// Connection Pool 생성
export const pool = mysql.createPool(dbConfig);

/**
 * Database 연결 테스트 함수
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('🐬 AWS RDS Aurora MySQL connected successfully');
    console.log(`📍 Connected to: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    // 간단한 테스트 쿼리
    const [rows] = await connection.execute('SELECT 1 as test');
    connection.release(); // 중요: 연결 반환
    
    console.log('✅ Database query test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('🔧 Check the following:');
    console.error('   - RDS instance is running and accessible');
    console.error('   - Security groups allow port 3306');
    console.error('   - VPC and subnet configurations');
    console.error('   - Database credentials are correct');
    return false;
  }
};

/**
 * Database 연결 상태 확인 함수 (Health Check용)
 */
export const getConnectionStatus = async () => {
  try {
    const connection = await pool.getConnection();
    
    // 연결 정보 확인
    const [statusRows] = await connection.execute('SELECT CONNECTION_ID() as connection_id, NOW() as server_time');
    const [variableRows] = await connection.execute("SHOW STATUS LIKE 'Threads_connected'");
    
    connection.release();
    
    return {
      status: 'connected',
      connectionId: (statusRows as any)[0]?.connection_id,
      currentTime: (statusRows as any)[0]?.server_time,
      threadsConnected: (variableRows as any)[0]?.Value,
      poolConfig: {
        connectionLimit: dbConfig.connectionLimit,
        host: dbConfig.host,
        database: dbConfig.database
      }
    };
  } catch (error) {
    return {
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      poolConfig: {
        connectionLimit: dbConfig.connectionLimit,
        host: dbConfig.host,
        database: dbConfig.database
      }
    };
  }
};

/**
 * Graceful shutdown을 위한 연결 종료 함수
 */
export const closePool = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('🔌 Database connection pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
};

// 프로세스 종료 시 연결 정리
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Server terminated...');
  await closePool();
  process.exit(0);
});

// 초기 연결 테스트 실행
testConnection();

export default pool; 