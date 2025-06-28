-- Migration: 004_performance_optimization.sql
-- Description: Performance optimization for production deployment
-- Date: 2025-06-28

-- characters 테이블 인덱스 확인 후 존재하지 않는 경우에만 추가
-- Note: is_active 컬럼이 없으므로 다른 조건으로 인덱스 생성

-- 호감도 시스템 최적화 인덱스
ALTER TABLE persona_character_relationships ADD INDEX idx_persona_affection (persona_id, affection_score DESC);
ALTER TABLE persona_character_relationships ADD INDEX idx_character_affection (character_id, affection_score DESC);
ALTER TABLE persona_character_relationships ADD INDEX idx_last_interaction (last_interaction DESC);

-- 채팅 시스템 최적화 인덱스
ALTER TABLE chats ADD INDEX idx_persona_character_created (persona_id, character_id, created_at DESC);
ALTER TABLE chats ADD INDEX idx_character_created (character_id, created_at DESC);

-- 사용자 시스템 최적화 인덱스  
ALTER TABLE users ADD INDEX idx_email_active (email, is_active);
ALTER TABLE personas ADD INDEX idx_user_created (user_id, created_at DESC);

-- 성능 최적화를 위한 테이블 통계 업데이트
ANALYZE TABLE characters;
ANALYZE TABLE persona_character_relationships;
ANALYZE TABLE chats;
ANALYZE TABLE users;
ANALYZE TABLE personas; 