# AWS Session Manager 설정 가이드

SSH 접속 불안정 문제의 근본적 해결책으로 AWS Session Manager를 도입합니다.

## 🌟 Session Manager의 장점

- **IP 제한 없음**: 어디서든 접속 가능
- **SSH 키 불필요**: AWS IAM 권한으로 접속
- **보안**: 모든 세션이 AWS CloudTrail에 로깅
- **브라우저 접속**: AWS 콘솔에서 직접 터미널 실행
- **안정성**: AWS 네트워크를 통한 안정적 연결

## 🔧 설정 과정

### 1. EC2 인스턴스에 IAM 역할 부여

1. **AWS 콘솔 > IAM > 역할 생성**
2. **신뢰할 수 있는 엔터티**: EC2
3. **권한 정책**: `AmazonSSMManagedInstanceCore`
4. **역할 이름**: `EC2-SessionManager-Role`

### 2. EC2 인스턴스에 역할 연결

1. **AWS 콘솔 > EC2 > 인스턴스**
2. **Mingling 인스턴스 선택**
3. **작업 > 보안 > IAM 역할 수정**
4. **위에서 생성한 역할 선택**

### 3. SSM Agent 설치 (Ubuntu)

```bash
# Session Manager로 접속 후 실행
sudo snap install amazon-ssm-agent --classic
sudo systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
sudo systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service
sudo systemctl status snap.amazon-ssm-agent.amazon-ssm-agent.service
```

### 4. 로컬 AWS CLI 설정

```bash
# AWS CLI 설치 (Mac)
brew install awscli

# Session Manager 플러그인 설치
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/mac/sessionmanager-bundle.zip" -o "sessionmanager-bundle.zip"
unzip sessionmanager-bundle.zip
sudo ./sessionmanager-bundle/install -i /usr/local/sessionmanagerplugin -b /usr/local/bin/session-manager-plugin

# AWS 자격 증명 설정
aws configure
# Access Key ID: [AWS IAM 사용자 액세스 키]
# Secret Access Key: [AWS IAM 사용자 시크릿 키]
# Default region: ap-southeast-2
# Default output format: json
```

### 5. Session Manager로 접속

#### A. AWS 콘솔에서 접속
1. **AWS 콘솔 > EC2 > 인스턴스**
2. **Mingling 인스턴스 선택**
3. **연결 > Session Manager > 연결**

#### B. AWS CLI로 접속
```bash
# 인스턴스 ID 확인
aws ec2 describe-instances --filters "Name=tag:Name,Values=mingling" --query 'Reservations[].Instances[].InstanceId' --output text

# Session Manager로 접속
aws ssm start-session --target i-xxxxxxxxxxxxxxxxx
```

#### C. SSH 스타일 접속 (권장)
```bash
# ~/.ssh/config 파일에 추가
host mingling
    HostName i-xxxxxxxxxxxxxxxxx
    User ubuntu
    ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'"
    ServerAliveInterval 60
    ServerAliveCountMax 3

# 접속
ssh mingling
```

## 🚀 GitHub Actions 업데이트

### Session Manager 사용으로 변경

```yaml
- name: Deploy to EC2 via Session Manager
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_DEFAULT_REGION: ap-southeast-2
  run: |
    # Install Session Manager plugin
    curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_64bit/session-manager-plugin.rpm" -o "session-manager-plugin.rpm"
    sudo yum install -y session-manager-plugin.rpm
    
    # Deploy via Session Manager
    aws ssm send-command \
      --instance-ids "${{ secrets.EC2_INSTANCE_ID }}" \
      --document-name "AWS-RunShellScript" \
      --parameters commands="cd /home/ubuntu/mingling && ./backend/deploy.sh main production"
```

## 🔍 트러블슈팅

### SSM Agent 상태 확인
```bash
# Session Manager로 접속 후
sudo systemctl status snap.amazon-ssm-agent.amazon-ssm-agent.service
```

### 연결이 안 될 때
1. IAM 역할이 EC2에 제대로 연결되었는지 확인
2. SSM Agent가 실행 중인지 확인
3. AWS 자격 증명이 올바른지 확인
4. 인스턴스 ID가 정확한지 확인

### Session Manager 로그 확인
```bash
# EC2에서
sudo journalctl -u snap.amazon-ssm-agent.amazon-ssm-agent.service
```

## 💡 추가 보안 설정

### VPC Endpoint 생성 (선택사항)
- **SSM**: com.amazonaws.ap-southeast-2.ssm
- **SSM Messages**: com.amazonaws.ap-southeast-2.ssmmessages  
- **EC2 Messages**: com.amazonaws.ap-southeast-2.ec2messages

이렇게 하면 인터넷 게이트웨이 없이도 Session Manager 사용 가능

## 📋 설정 완료 체크리스트

- [ ] IAM 역할 생성 (`AmazonSSMManagedInstanceCore`)
- [ ] EC2 인스턴스에 IAM 역할 연결
- [ ] SSM Agent 설치 및 실행
- [ ] AWS CLI 설치 및 자격 증명 설정
- [ ] Session Manager 플러그인 설치
- [ ] 접속 테스트
- [ ] GitHub Actions 업데이트
- [ ] SSH 보안 그룹 규칙 제거 (선택사항) 