import express from 'express';
import jwt from 'jsonwebtoken';
import { pool as db } from '../db';

const router = express.Router();

// JWT Secret (환경변수로 설정되어야 함)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

/**
 * Firebase 사용자 인증 후 JWT 토큰 발급
 * POST /auth/firebase
 */
router.post('/firebase', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    if (!uid || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'uid and email are required'
      });
    }

    // 사용자가 데이터베이스에 존재하는지 확인
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE firebase_uid = ?',
      [uid]
    ) as any;

    let user;
    if (existingUsers.length === 0) {
      // 새 사용자 생성
      await db.execute(
        'INSERT INTO users (firebase_uid, email, display_name, photo_url, jam_points, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [uid, email, displayName || null, photoURL || null, 1000] // 초기 잼 포인트 1000
      );

      const [newUsers] = await db.execute(
        'SELECT * FROM users WHERE firebase_uid = ?',
        [uid]
      ) as any;
      user = newUsers[0];

      console.log(`✅ New user created: ${email}`);
    } else {
      // 기존 사용자 정보 업데이트
      user = existingUsers[0];
      await db.execute(
        'UPDATE users SET email = ?, display_name = ?, photo_url = ?, last_login = NOW() WHERE firebase_uid = ?',
        [email, displayName || user.display_name, photoURL || user.photo_url, uid]
      );

      console.log(`✅ Existing user logged in: ${email}`);
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user.id,
        uid: user.firebase_uid,
        email: user.email,
        displayName: user.display_name
      },
      JWT_SECRET,
      { expiresIn: '7d' } // 7일 유효
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        uid: user.firebase_uid,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url,
        jamPoints: user.jam_points
      }
    });

  } catch (error) {
    console.error('❌ Firebase auth error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'Failed to authenticate with Firebase'
    });
  }
});

/**
 * 현재 사용자 정보 조회
 * GET /auth/me
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const [users] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [decoded.userId]
    ) as any;

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User does not exist'
      });
    }

    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        uid: user.firebase_uid,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url,
        jamPoints: user.jam_points
      }
    });

  } catch (error) {
    console.error('❌ Auth verification error:', error);
    res.status(401).json({
      error: 'Invalid token',
      message: 'Failed to verify authentication token'
    });
  }
});

export default router; 