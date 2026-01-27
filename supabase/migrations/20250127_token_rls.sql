-- Enable RLS on all token tables
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_purchases ENABLE ROW LEVEL SECURITY;

-- User Tokens: Users can only view their own token record
CREATE POLICY "Users can view own tokens"
ON user_tokens FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

-- Token Usage: Users can only view their own usage records
CREATE POLICY "Users can view own usage"
ON token_usage FOR SELECT
TO authenticated
USING (
  user_tokens_id IN (
    SELECT id FROM user_tokens WHERE user_id = auth.uid()::text
  )
);

-- Token Purchases: Users can only view their own purchase records
CREATE POLICY "Users can view own purchases"
ON token_purchases FOR SELECT
TO authenticated
USING (
  user_tokens_id IN (
    SELECT id FROM user_tokens WHERE user_id = auth.uid()::text
  )
);

-- Note: INSERT/UPDATE/DELETE operations are handled server-side via Prisma
-- using the service role connection, which bypasses RLS.
-- No client-side write policies are needed.
