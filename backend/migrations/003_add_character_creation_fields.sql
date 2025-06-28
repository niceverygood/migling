-- Migration: 003_add_character_creation_fields.sql
-- Description: Add fields for character creation feature
-- Date: 2025-06-28

-- Add new fields to characters table for detailed character creation
ALTER TABLE characters ADD COLUMN age INT;
ALTER TABLE characters ADD COLUMN occupation VARCHAR(100);
ALTER TABLE characters ADD COLUMN one_liner TEXT COMMENT '캐릭터 한 마디';
ALTER TABLE characters ADD COLUMN category VARCHAR(50) COMMENT '카테고리 (애니메이션, 게임, 창작 등)';
ALTER TABLE characters ADD COLUMN gender ENUM('male', 'female', 'unspecified') DEFAULT 'unspecified';
ALTER TABLE characters ADD COLUMN background_info TEXT COMMENT '배경, 가족, MBTI 등 기본 설정';
ALTER TABLE characters ADD COLUMN habits TEXT COMMENT '습관적인 말과 행동';
ALTER TABLE characters ADD COLUMN hashtags JSON COMMENT '해시태그 배열';
ALTER TABLE characters ADD COLUMN first_scene_setting TEXT COMMENT '첫 장면 설정';
ALTER TABLE characters ADD COLUMN chat_ending TEXT COMMENT '채팅 첫 마디';
ALTER TABLE characters ADD COLUMN is_private BOOLEAN DEFAULT FALSE COMMENT '비공개 캐릭터 여부';
ALTER TABLE characters ADD COLUMN chat_room_code VARCHAR(10) COMMENT '채팅방 코드 (비공개인 경우)';

-- Add indexes for search and filtering
ALTER TABLE characters ADD INDEX idx_category (category);
ALTER TABLE characters ADD INDEX idx_gender (gender);
ALTER TABLE characters ADD INDEX idx_user_private (user_id, is_private);
ALTER TABLE characters ADD INDEX idx_chat_room_code (chat_room_code); 