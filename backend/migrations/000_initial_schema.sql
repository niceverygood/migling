CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  photo_url VARCHAR(512),
  jam_points INT DEFAULT 1000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_firebase_uid (firebase_uid),
  INDEX idx_email (email)
);

CREATE TABLE IF NOT EXISTS characters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  personality TEXT,
  avatar_url VARCHAR(512),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_active (is_active)
);

CREATE TABLE IF NOT EXISTS chats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  character_id INT NOT NULL,
  message TEXT NOT NULL,
  is_user_message BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  INDEX idx_user_character (user_id, character_id),
  INDEX idx_created_at (created_at)
);

INSERT INTO characters (name, description, personality, avatar_url) VALUES
('애니', '오늘 하루 어떠셨나요? 재미있는 이야기 들려주세요!', '밝고 친근한 성격의 AI 친구', '🧊'),
('루나', '잠깐의 틈기 쫄아 진해 막음으로 듣고 한침이 어떠한 어떠하실 듯으로 듯해요!', '지적이고 차분한 AI 캐릭터', '🌙'),
('태오', '새로운 도전에 대해 이야기해볼까요?', '모험적이고 활발한 AI 캐릭터', '🦁'),
('사라', '오늘 남기고 장답 좋네요!', '감성적이고 따뜻한 AI 캐릭터', '🦋')
ON DUPLICATE KEY UPDATE name=VALUES(name); 