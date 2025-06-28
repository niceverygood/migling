-- Migration: 002_redesign_schema.sql
-- Description: Redesign database schema with user-created characters and personas
-- Date: 2025-06-28

-- 1. characters 테이블에 user_id 추가 (이미 존재함 - skip)

-- 2. personas 테이블 생성 (user의 멀티프로필)
CREATE TABLE IF NOT EXISTS personas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_url VARCHAR(512),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_default (user_id, is_default)
);

-- 3. chats 테이블이 이미 새로운 구조로 변경되어 있음 (skip)
-- 4. chats 테이블에 호감도 변화량 컬럼 추가
ALTER TABLE chats ADD COLUMN affection_change INT DEFAULT 0 COMMENT '이 메시지로 인한 호감도 변화량 (-10 ~ +10)';

-- 5. 기존 캐릭터들을 시스템 캐릭터로 처리 (user_id = NULL)
UPDATE characters SET user_id = NULL WHERE user_id IS NULL;

-- 6. users 테이블에 기본 정보 추가 (이미 존재함 - skip)

-- 7. 호감도 시스템: persona-character 관계 테이블 생성
CREATE TABLE IF NOT EXISTS persona_character_relationships (
  id INT PRIMARY KEY AUTO_INCREMENT,
  persona_id INT NOT NULL,
  character_id INT NOT NULL,
  affection_score INT DEFAULT 50 COMMENT '호감도 점수 (0-100, 기본값 50)',
  total_messages INT DEFAULT 0 COMMENT '총 대화 메시지 수',
  last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '마지막 상호작용 시간',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_persona_character (persona_id, character_id),
  FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  INDEX idx_persona_id (persona_id),
  INDEX idx_character_id (character_id),
  INDEX idx_affection_score (affection_score)
);

-- 8. chats 테이블에 호감도 변화량 인덱스 추가
ALTER TABLE chats ADD INDEX idx_affection_change (affection_change); 