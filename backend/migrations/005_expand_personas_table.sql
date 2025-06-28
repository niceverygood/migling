-- Migration: 005_expand_personas_table.sql
-- Description: Expand personas table for persona creation feature with performance optimization
-- Date: 2025-06-28

-- Add new fields for detailed persona creation
ALTER TABLE personas ADD COLUMN age INT;
ALTER TABLE personas ADD COLUMN occupation VARCHAR(100);
ALTER TABLE personas ADD COLUMN gender ENUM('male', 'female', 'unspecified') DEFAULT 'unspecified';
ALTER TABLE personas ADD COLUMN basic_info TEXT COMMENT '외모, 성격 등 기본 정보';
ALTER TABLE personas ADD COLUMN habits TEXT COMMENT '습관적인 말과 행동';
ALTER TABLE personas ADD COLUMN avatar_url VARCHAR(512);
ALTER TABLE personas ADD COLUMN is_default BOOLEAN DEFAULT FALSE COMMENT '기본 페르소나 여부';

-- 성능 최적화를 위한 인덱스 (배포 환경 고려)
ALTER TABLE personas ADD INDEX idx_user_default (user_id, is_default);
ALTER TABLE personas ADD INDEX idx_user_created_optimized (user_id, created_at DESC);
ALTER TABLE personas ADD INDEX idx_gender_age (gender, age);

-- 기존 데이터 중 이름이 'Me'인 것들을 기본 페르소나로 설정
UPDATE personas SET is_default = TRUE WHERE name = 'Me' OR name = 'Default Persona';

-- 성능 통계 업데이트
ANALYZE TABLE personas; 