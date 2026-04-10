CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  repo VARCHAR(255) NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  confirm_token UUID DEFAULT gen_random_uuid(),
  unsubscribe_token UUID DEFAULT gen_random_uuid(),
  last_seen_tag VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email, repo)
);