CREATE TABLE IF NOT EXISTS posts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),          -- UUID, from Node.js
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT
);
