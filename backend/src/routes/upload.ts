import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 업로드 디렉토리 확인 및 생성
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 파일명 생성: timestamp_randomstring.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `avatar_${uniqueSuffix}${extension}`);
  }
});

// 파일 필터 (이미지 파일만 허용)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
});

// POST /api/upload/avatar - 아바타 이미지 업로드
router.post('/avatar', upload.single('avatar'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 환경에 따른 서버 URL 설정
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.NODE_ENV === 'production' 
      ? process.env.PRODUCTION_HOST || 'ec2-52-63-124-130.ap-southeast-2.compute.amazonaws.com'
      : 'localhost';
    const port = process.env.NODE_ENV === 'production' 
      ? process.env.PRODUCTION_PORT || '3001'
      : process.env.PORT || '3003';
    
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `${protocol}://${host}:${port}`
      : `${protocol}://${host}:${port}`;

    const fileUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    console.log('✅ Avatar uploaded:', {
      filename: req.file.filename,
      size: req.file.size,
      url: fileUrl
    });

    res.json({
      success: true,
      filename: req.file.filename,
      url: fileUrl,
      size: req.file.size
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// DELETE /api/upload/avatar/:filename - 아바타 이미지 삭제
router.delete('/avatar/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ Avatar deleted:', filename);
      res.json({ success: true, message: 'Avatar deleted successfully' });
    } else {
      res.status(404).json({ error: 'Avatar file not found' });
    }
  } catch (error) {
    console.error('Avatar delete error:', error);
    res.status(500).json({ error: 'Failed to delete avatar' });
  }
});

export default router; 