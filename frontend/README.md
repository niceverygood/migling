# Mingling Frontend

Emotion AI Character Chat App Frontend

Built with React, TypeScript, Vite, Tailwind CSS

## Features
- Firebase Authentication (Google Login)
- Real-time Chat with AI Characters
- Mobile-first Design
- PWA Support

## Deployment
Deployed on Vercel: https://mingling.vercel.app

<!-- Trigger redeploy after repository rename -->

## 🚀 기능

- **Firebase 구글 인증**: 간편한 소셜 로그인
- **모바일 우선 디자인**: 반응형 UI/UX
- **하단 탭 네비게이션**: 친구, 채팅, For You, MY
- **실시간 채팅**: AI 캐릭터와의 대화
- **캐릭터 관리**: 나만의 AI 친구 생성 및 관리
- **사용자 프로필**: 잼(게임 화폐), 레벨, 통계

## 🛠 기술 스택

- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **Tailwind CSS** (스타일링)
- **React Router** (라우팅)
- **Firebase Auth** (인증)
- **Axios** (API 통신)

## 📱 화면 구성

### 인증
- `/login` - Google 로그인 화면

### 메인 탭들
- `/friends` - 친구 목록 및 AI 친구 추천
- `/chat` - 채팅방 목록 및 대화
- `/foryou` - 개인화된 추천 콘텐츠
- `/my` - 사용자 프로필 및 내 캐릭터

## 🔧 개발 환경 설정

### 1. 의존성 설치
\`\`\`bash
npm install
\`\`\`

### 2. 환경변수 설정
\`\`\`.env
REACT_APP_API_BASE_URL=http://52.63.124.130:3001
REACT_APP_FIREBASE_API_KEY=AIzaSyCpGXULewwRPmUiljiFCZcZ25QPMYEVUn4
REACT_APP_FIREBASE_AUTH_DOMAIN=mingling-3f2d5.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=mingling-3f2d5
REACT_APP_FIREBASE_STORAGE_BUCKET=mingling-3f2d5.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=127809706418
REACT_APP_FIREBASE_APP_ID=1:127809706418:web:97eba244663b84a786ecab
REACT_APP_FIREBASE_MEASUREMENT_ID=G-KYR28WQL23
\`\`\`

### 3. 개발 서버 실행
\`\`\`bash
npm run dev
\`\`\`

### 4. 빌드
\`\`\`bash
npm run build
\`\`\`

## 🚀 배포

### Vercel 배포
\`\`\`bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
\`\`\`

### 환경변수 설정 (Vercel)
Vercel 대시보드에서 다음 환경변수들을 설정하세요:
- `REACT_APP_API_BASE_URL`
- `REACT_APP_FIREBASE_*` (Firebase 설정)

## 📋 프로젝트 구조

\`\`\`
src/
├── components/
│   ├── Auth/
│   │   └── Login.tsx           # 로그인 화면
│   ├── Layout/
│   │   ├── Layout.tsx          # 메인 레이아웃
│   │   └── BottomNavigation.tsx # 하단 네비게이션
│   └── Tabs/
│       ├── Friends.tsx         # 친구 탭
│       ├── Chat.tsx           # 채팅 탭
│       ├── ForYou.tsx         # For You 탭
│       └── My.tsx             # MY 탭
├── contexts/
│   └── AuthContext.tsx        # 인증 컨텍스트
├── lib/
│   ├── firebase.ts           # Firebase 설정
│   └── api.ts                # API 클라이언트
├── App.tsx                   # 메인 앱 컴포넌트
├── main.tsx                  # 엔트리 포인트
└── index.css                 # 글로벌 스타일
\`\`\`

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Purple (#9333ea)
- **Secondary**: Pink (#ec4899)
- **Success**: Green (#22c55e)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)

### 컴포넌트 클래스
- `.btn-primary` - 기본 버튼
- `.btn-secondary` - 보조 버튼
- `.card` - 카드 컨테이너
- `.input-field` - 입력 필드

## 📱 모바일 최적화

- **반응형 디자인**: 모든 화면 크기 지원
- **터치 최적화**: 터치 인터랙션 최적화
- **iOS Safari 지원**: viewport, 스크롤 처리
- **Progressive Web App**: PWA 기능 준비

## 🔐 보안

- **HTTPS 강제**: 모든 통신 암호화
- **JWT 토큰**: 안전한 인증 관리
- **Firebase 보안 규칙**: 인증된 사용자만 접근
- **XSS 방지**: Content Security Policy

## 📊 성능 최적화

- **코드 스플리팅**: 라우트별 청크 분할
- **Tree Shaking**: 미사용 코드 제거
- **이미지 최적화**: WebP 포맷 지원
- **캐싱 전략**: Service Worker 준비

## 🐛 문제 해결

### 빌드 오류
\`\`\`bash
# 캐시 정리
npm run build --clean

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Firebase 인증 오류
- Firebase 콘솔에서 도메인 허용 목록 확인
- API 키 및 프로젝트 설정 재확인

## 📞 지원

문제가 있으시면 이슈를 등록해주세요:
- GitHub Issues
- 개발팀 연락처

## 📋 라이선스

MIT License
