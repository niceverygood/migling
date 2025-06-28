import dotenv from 'dotenv';
import path from 'path';

/**
 * Environment Configuration Loader
 * 개발 환경에 따라 적절한 .env 파일을 로드합니다
 */

// NODE_ENV 기본값 설정
const NODE_ENV = process.env.NODE_ENV || 'development';

// 환경에 따른 .env 파일 경로 결정
const envFile = NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';

const envPath = path.resolve(process.cwd(), envFile);

// 해당 환경의 .env 파일 로드
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`⚠️  Warning: Could not load ${envFile}, falling back to default .env`);
  // fallback to default .env file
  dotenv.config();
}

console.log(`📂 Environment: ${NODE_ENV}`);
console.log(`📁 Config file: ${envFile}`);
console.log(`🗄️  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// 필수 환경변수 검증 (DB_PASSWORD는 빈 문자열 허용)
const requiredEnvVars = [
  'DB_HOST',
  'DB_USER', 
  'DB_NAME',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

// DB_PASSWORD는 별도 검증 (undefined는 불허, 빈 문자열은 허용)
if (process.env.DB_PASSWORD === undefined) {
  missingVars.push('DB_PASSWORD');
}

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error(`💡 Please check your ${envFile} file`);
  process.exit(1);
}

export const config = {
  NODE_ENV,
  PORT: parseInt(process.env.PORT || '3001'),
  
  // Database
  DB_HOST: process.env.DB_HOST,
  DB_PORT: parseInt(process.env.DB_PORT || '3306'),
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // CORS
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

export default config; 