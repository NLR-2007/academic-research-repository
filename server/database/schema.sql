CREATE DATABASE IF NOT EXISTS academic_research_repository;
USE academic_research_repository;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  institution VARCHAR(180),
  research_role VARCHAR(120),
  bio TEXT,
  scholar_links JSON,
  profile_image VARCHAR(500),
  password_hash VARCHAR(255) NOT NULL,
  badge_level ENUM('Newcomer','Bronze','Silver','Gold','Diamond') DEFAULT 'Newcomer',
  approved_count INT DEFAULT 0,
  rejected_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW sqlusers AS SELECT * FROM users;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telegram_chat_id VARCHAR(120),
  otp_code VARCHAR(12),
  otp_expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  sub_category VARCHAR(120),
  icon_color VARCHAR(24) DEFAULT '#2563eb',
  description TEXT,
  paper_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS research_papers (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  authors JSON NOT NULL,
  abstract TEXT NOT NULL,
  keywords JSON,
  doi VARCHAR(120),
  journal VARCHAR(180),
  year INT NOT NULL,
  volume VARCHAR(80),
  issue VARCHAR(80),
  category_id INT NOT NULL,
  sub_category VARCHAR(120),
  visibility ENUM('public','private','restricted') DEFAULT 'public',
  license ENUM('open_access','copyright_reserved','creative_commons') DEFAULT 'open_access',
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  deletion_reason TEXT,
  file_path VARCHAR(500) NOT NULL,
  view_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  approved_by INT NULL,
  FULLTEXT KEY papers_fulltext (title, abstract, journal, sub_category),
  CONSTRAINT fk_papers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_papers_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_papers_admin FOREIGN KEY (approved_by) REFERENCES admins(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  paper_id CHAR(36),
  type ENUM('approved','rejected','deleted','access_request','access_granted') NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_paper FOREIGN KEY (paper_id) REFERENCES research_papers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS access_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id CHAR(36) NOT NULL,
  paper_id CHAR(36) NOT NULL,
  status ENUM('pending','granted','denied') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_request (requester_id, paper_id),
  CONSTRAINT fk_access_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_access_paper FOREIGN KEY (paper_id) REFERENCES research_papers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS paper_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36),
  paper_id CHAR(36) NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  view_week INT NOT NULL,
  UNIQUE KEY unique_user_paper_week (user_id, paper_id, view_week),
  CONSTRAINT fk_views_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_views_paper FOREIGN KEY (paper_id) REFERENCES research_papers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS private_share_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paper_id CHAR(36) NOT NULL,
  token VARCHAR(120) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_share_paper FOREIGN KEY (paper_id) REFERENCES research_papers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  paper_id CHAR(36),
  action ENUM('approve','reject','delete') NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_admin FOREIGN KEY (admin_id) REFERENCES admins(id),
  CONSTRAINT fk_logs_paper FOREIGN KEY (paper_id) REFERENCES research_papers(id) ON DELETE SET NULL
);

INSERT IGNORE INTO categories (id, name, sub_category, icon_color, description) VALUES
(1, 'Artificial Intelligence', 'AI', '#0f766e', 'Research in reasoning, agents, LLMs, and intelligent systems'),
(2, 'Machine Learning', 'ML', '#2563eb', 'Models, optimization, deep learning, and applied ML'),
(3, 'Web Development', 'Software', '#ea580c', 'Frontend, backend, distributed systems, and web platforms'),
(4, 'Biotechnology', 'Life Sciences', '#16a34a', 'Biotech, genomics, and biomedical research'),
(5, 'Physics', 'Science', '#7c3aed', 'Theoretical, experimental, and applied physics'),
(6, 'Chemistry', 'Science', '#db2777', 'Organic, inorganic, analytical, and physical chemistry'),
(7, 'Economics', 'Social Science', '#ca8a04', 'Economic theory, policy, finance, and markets');
