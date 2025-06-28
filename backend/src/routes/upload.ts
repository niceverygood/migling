import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Cloudinary 설정 (환경변수가 있을 때만)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️ Cloudinary configured for cloud storage');
} else {
  console.log('📁 Using local file system storage (Cloudinary not configured)');
}

// 클라우드 저장소 사용 여부 결정
const useCloudStorage = () => {
  return process.env.NODE_ENV === 'production' && 
         process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET;
};

// 업로드 디렉토리 확인 및 생성 (로컬 저장용)
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정 - 메모리 저장 (클라우드 업로드를 위해)
const storage = multer.memoryStorage();

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

// 로컬 파일 저장 함수
const saveToLocalStorage = async (file: Express.Multer.File): Promise<string> => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const extension = path.extname(file.originalname);
  const filename = `avatar_${uniqueSuffix}${extension}`;
  const filePath = path.join(uploadDir, filename);
  
  await fs.promises.writeFile(filePath, file.buffer);
  
  // 환경에 따른 서버 URL 설정
  let baseUrl: string;
  if (process.env.NODE_ENV === 'production') {
    const productionHost = process.env.PRODUCTION_HOST || '52.63.124.130';
    const productionPort = process.env.PRODUCTION_PORT || '3001';
    baseUrl = `http://${productionHost}:${productionPort}`;
  } else {
    const devPort = process.env.PORT || '3003';
    baseUrl = `http://localhost:${devPort}`;
  }
  
  return `${baseUrl}/uploads/avatars/${filename}`;
};

// 클라우드 저장 함수
const saveToCloudStorage = async (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'mingling/avatars',
        transformation: [
          { width: 500, height: 500, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    );
    
    uploadStream.end(file.buffer);
  });
};

// POST /api/upload/avatar - 아바타 이미지 업로드
router.post('/avatar', upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let fileUrl: string;
    let storageType: string;

    if (useCloudStorage()) {
      // 클라우드 스토리지 사용
      console.log('☁️ Uploading to Cloudinary...');
      fileUrl = await saveToCloudStorage(req.file);
      storageType = 'cloudinary';
    } else {
      // 로컬 파일 시스템 사용
      console.log('📁 Uploading to local storage...');
      fileUrl = await saveToLocalStorage(req.file);
      storageType = 'local';
    }

    console.log('✅ Avatar uploaded:', {
      filename: req.file.originalname,
      size: req.file.size,
      url: fileUrl,
      storage: storageType,
      environment: process.env.NODE_ENV
    });

    res.json({
      success: true,
      filename: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
      storage: storageType
    });
  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload avatar',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/upload/avatar/:filename - 아바타 이미지 삭제 (로컬 파일만)
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
    console.error('❌ Avatar delete error:', error);
    res.status(500).json({ error: 'Failed to delete avatar' });
  }
});

export default router; 