# AWS RDS Aurora MySQL Setup Guide

## Create RDS Aurora MySQL Cluster

### 1. Go to AWS RDS Console
- Region: ap-southeast-2 (Sydney)
- Choose "Create database"

### 2. Database Creation Settings
```
Engine type: Amazon Aurora
Edition: MySQL-Compatible
Version: 8.0.mysql_aurora.3.02.0 (or latest)
Templates: Dev/Test (for cost optimization)
```

### 3. Cluster Configuration
```
DB cluster identifier: mingling
Master username: root
Master password: Mingle123!
```

### 4. Instance Configuration
```
DB instance class: db.t3.medium (or db.t4g.medium for cost)
Multi-AZ deployment: No (for dev/test)
```

### 5. Connectivity
```
VPC: Default VPC
Subnet group: default
Public access: Yes (for external access)
VPC security group: Create new
  - Name: mingling-rds-sg
  - Allow inbound: Port 3306 from EC2 security group
```

### 6. Database Options
```
Initial database name: mingling
Port: 3306
Parameter group: default.aurora-mysql8.0
```

### 7. Security Group Rules
**RDS Security Group (mingling-rds-sg)**:
- Type: MYSQL/Aurora
- Protocol: TCP  
- Port: 3306
- Source: sg-xxxxx (EC2 security group ID)

**EC2 Security Group** (add if not exists):
- Type: Custom TCP
- Protocol: TCP
- Port: 3001
- Source: 0.0.0.0/0

## Expected Endpoint Format
After creation, the endpoint should look like:
```
mingling.cluster-xxxxx.ap-southeast-2.rds.amazonaws.com
```

## Connection Test Commands
```bash
# From EC2 instance
mysql -h YOUR-ACTUAL-ENDPOINT -u root -p
# Password: Mingle123!

# Test DNS resolution
nslookup YOUR-ACTUAL-ENDPOINT
``` 