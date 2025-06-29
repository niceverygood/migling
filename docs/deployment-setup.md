# Mingling 배포 시스템 설정 가이드

## 🔧 GitHub Secrets 설정

GitHub 저장소의 **Settings > Secrets and variables > Actions**에서 다음 secrets를 설정하세요:

### 필수 Secrets

```
EC2_HOST=52.63.124.130
EC2_USER=ubuntu
EC2_PRIVATE_KEY=<mingling-key.pem 파일의 내용>
EC2_HEALTH_CHECK_URL=http://52.63.124.130:3001
```

### EC2_PRIVATE_KEY 설정 방법

1. `mingling-key.pem` 파일을 열기
2. 파일 전체 내용을 복사 (-----BEGIN PRIVATE KEY----- 부터 -----END PRIVATE KEY----- 까지)
3. GitHub Secrets에 붙여넣기

## 🚀 자동 배포 워크플로우

### 트리거 조건
- `main` 브랜치에 push할 때
- `backend/` 폴더에 변경사항이 있을 때
- 수동 실행 (workflow_dispatch)

### 배포 과정
1. **코드 체크아웃**
2. **Node.js 환경 설정**
3. **의존성 설치 및 빌드**
4. **EC2 서버 배포**
   - PM2 서비스 중지
   - 최신 코드 pull
   - 의존성 설치
   - TypeScript 빌드
   - 데이터베이스 마이그레이션
   - PM2 서비스 재시작
5. **Health Check**

### 배포 실행 방법

#### 자동 배포
```bash
# 백엔드 코드 변경 후 main 브랜치에 push
git add .
git commit -m "Update backend"
git push origin main
```

#### 수동 배포
1. GitHub 저장소로 이동
2. **Actions** 탭 클릭
3. **Deploy Backend to EC2** 워크플로우 선택
4. **Run workflow** 버튼 클릭

## 🗄️ 데이터베이스 마이그레이션

### 새 마이그레이션 추가
```bash
# 마이그레이션 파일 생성 (번호 순서대로)
touch backend/migrations/002_add_new_feature.sql

# SQL 작성
CREATE TABLE IF NOT EXISTS new_table (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ...
);
```

### 마이그레이션 실행
```bash
# 로컬 개발 환경
npm run migrate:dev

# 운영 환경 (배포 시 자동 실행됨)
NODE_ENV=production npm run migrate
```

## 🔍 배포 상태 확인

### PM2 상태 확인
```bash
# EC2 서버 접속
ssh -i mingling-key.pem ubuntu@52.63.124.130

# PM2 상태 확인
pm2 status
pm2 logs mingling-backend
```

### Health Check
```bash
# 로컬에서 확인
curl http://52.63.124.130:3001/api/health

# 브라우저에서 확인
# http://52.63.124.130:3001/api/health
```

## 🛠️ 트러블슈팅

### 배포 실패 시
1. GitHub Actions 로그 확인
2. EC2 서버 접속하여 에러 로그 확인
3. PM2 로그 확인: `pm2 logs mingling-backend`
4. 수동으로 배포 스크립트 실행: `./deploy.sh main production`

### 마이그레이션 실패 시
1. 데이터베이스 연결 확인
2. SQL 문법 오류 확인
3. 마이그레이션 테이블 상태 확인: `SELECT * FROM migrations;`

### PM2 서비스 복구
```bash
# PM2 서비스가 중지된 경우
pm2 start build/index.js --name mingling-backend

# PM2가 완전히 문제가 있는 경우
pm2 delete mingling-backend
pm2 start build/index.js --name mingling-backend
pm2 save
```

## 📋 체크리스트

### 초기 설정
- [ ] GitHub Secrets 설정 완료
- [ ] EC2 서버에 Node.js, PM2 설치
- [ ] EC2 서버에 프로젝트 클론
- [ ] EC2 서버에 `.env.production` 파일 설정

### 배포 전 확인사항
- [ ] 로컬에서 빌드 테스트
- [ ] 마이그레이션 파일 검증
- [ ] 환경변수 설정 확인
- [ ] Health Check 엔드포인트 동작 확인

## 🌐 환경별 설정

### 개발 환경 (로컬)
- 환경변수: `.env.development`
- 데이터베이스: 로컬 MySQL
- 프론트엔드: `localhost:3000`

### 운영 환경 (EC2)
- 환경변수: `.env.production`
- 데이터베이스: AWS RDS
- 프론트엔드: `mingling.vercel.app` 