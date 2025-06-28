# 🗄️ AWS RDS 연결 완전 가이드

## 📋 현재 상황
- ❌ RDS 엔드포인트 DNS 해결 실패: `mingling.cluster-cf48qyyuqv7.ap-southeast-2.rds.amazonaws.com`
- ✅ 백엔드 서버는 정상 실행 중 (http://52.63.124.130:3001)

## 🔍 1단계: RDS 클러스터 상태 확인

### 1-1. AWS 콘솔 접속
```
1. AWS Console → RDS → Databases
2. 리전: ap-southeast-2 (Sydney) 확인
3. "mingling" 클러스터 찾기
```

### 1-2. 상태 확인 체크리스트
- [ ] 클러스터 상태: **Available** 인지 확인
- [ ] 엔드포인트 URL 복사
- [ ] Writer/Reader 인스턴스 상태 확인
- [ ] VPC 및 서브넷 그룹 확인

## 🛠️ 2단계: 문제별 해결 방법

### 케이스 A: 클러스터가 존재하지 않는 경우

#### A-1. 새 RDS Aurora 클러스터 생성
```
Engine: Aurora MySQL 8.0
Template: Dev/Test
DB cluster identifier: mingling
Master username: root  
Master password: Mingle123!
Instance class: db.t3.medium
Storage: General Purpose SSD
```

#### A-2. 네트워크 설정
```
VPC: Default VPC
Subnet group: default
Public access: YES (중요!)
VPC security group: 새로 생성
```

#### A-3. 보안 그룹 설정
```
Inbound Rules:
- Type: MYSQL/Aurora (3306)
- Protocol: TCP
- Port: 3306  
- Source: EC2 보안 그룹 ID 또는 0.0.0.0/0
```

### 케이스 B: 클러스터가 존재하는 경우

#### B-1. 엔드포인트 확인 및 업데이트
```bash
# EC2에서 실행할 명령어들
ssh -i mingling-key.pem ec2-user@52.63.124.130
cd ~/mingling/backend

# 올바른 엔드포인트로 .env 업데이트
./fix-db-connection.sh
```

#### B-2. 네트워크 문제 해결
```bash
# 1. DNS 해결 테스트
nslookup YOUR-CORRECT-ENDPOINT

# 2. 포트 연결 테스트  
telnet YOUR-CORRECT-ENDPOINT 3306

# 3. 직접 MySQL 연결 테스트
mysql -h YOUR-CORRECT-ENDPOINT -u root -p
```

## 🔧 3단계: 보안 그룹 설정

### 3-1. RDS 보안 그룹 설정
```
Group Name: mingling-rds-sg
Inbound Rules:
┌─────────────┬─────────┬──────┬─────────────────┬─────────────┐
│ Type        │ Protocol│ Port │ Source          │ Description │
├─────────────┼─────────┼──────┼─────────────────┼─────────────┤
│ MYSQL/Aurora│ TCP     │ 3306 │ sg-xxxxx        │ From EC2    │
│ MYSQL/Aurora│ TCP     │ 3306 │ 0.0.0.0/0      │ External    │
└─────────────┴─────────┴──────┴─────────────────┴─────────────┘
```

### 3-2. EC2 보안 그룹 확인
```
기존 EC2 보안 그룹에 다음이 있는지 확인:
┌─────────────┬─────────┬──────┬─────────────────┬─────────────┐
│ Type        │ Protocol│ Port │ Source          │ Description │
├─────────────┼─────────┼──────┼─────────────────┼─────────────┤
│ Custom TCP  │ TCP     │ 3001 │ 0.0.0.0/0      │ Backend API │
│ SSH         │ TCP     │ 22   │ YOUR-IP/32      │ SSH Access  │
└─────────────┴─────────┴──────┴─────────────────┴─────────────┘
```

## 🧪 4단계: 연결 테스트

### 4-1. EC2에서 직접 테스트
```bash
# 1. MySQL 클라이언트로 연결
mysql -h YOUR-ENDPOINT -u root -pMingle123!

# 2. 성공시 다음 명령어들 실행
SHOW DATABASES;
USE mingling;
SHOW TABLES;
EXIT;
```

### 4-2. 백엔드 애플리케이션 테스트
```bash
# 1. 백엔드 재시작
pm2 restart mingling-backend

# 2. Health Check 확인
curl http://localhost:3001/api/health

# 3. 외부에서 확인
curl http://52.63.124.130:3001/api/health
```

## 📝 5단계: 성공 확인

### 성공시 나타나야 할 결과:
```json
{
  "status": "healthy",
  "db": "connected",
  "timestamp": "2025-06-27T...",
  "database": {
    "host": "your-endpoint",
    "database": "mingling",
    "connectionLimit": 5
  },
  "server": {
    "uptime": 123.456,
    "memory": {...},
    "version": "v18.20.8",
    "environment": "production"
  }
}
```

## 🚨 일반적인 문제들

### DNS 해결 실패 (NXDOMAIN)
- 엔드포인트 URL 오타 확인
- 리전이 ap-southeast-2인지 확인  
- 클러스터가 실제로 존재하는지 확인

### 연결 거부 (Connection refused)
- 보안 그룹 3306 포트 오픈 확인
- RDS 퍼블릭 액세스 활성화 확인
- VPC/서브넷 설정 확인

### 인증 실패 (Access denied)
- 사용자명: root 확인
- 비밀번호: Mingle123! 확인
- MySQL 사용자 권한 확인

## 📞 다음 단계
1. 먼저 AWS 콘솔에서 RDS 상태 확인
2. 위 가이드에 따라 단계별 해결
3. 문제 발생시 구체적 에러 메시지 공유 