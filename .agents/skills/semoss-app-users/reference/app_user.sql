-- Add to sql/init.sql (and add `DROP TABLE IF EXISTS app_user;` at the top).
-- user_id is the SEMOSS username (what getCurrentUsername() returns).
CREATE TABLE app_user (
	user_id VARCHAR(36) NOT NULL,
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	is_inactive BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY (user_id)
);

-- Seed yourself so you can get past the no-access screen. user_id must be your SEMOSS username.
INSERT INTO app_user (user_id, first_name, last_name, email) VALUES
	('your-semoss-username', 'First', 'Last', 'you@example.com');
