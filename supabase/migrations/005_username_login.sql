-- Enable login by username (display_name)
-- Make display_name unique and add function to lookup email by username

-- Add unique constraint to display_name (case-insensitive)
ALTER TABLE profiles ADD CONSTRAINT profiles_display_name_unique UNIQUE (display_name);

-- Create index for faster lookups (case-insensitive)
CREATE INDEX idx_profiles_display_name_lower ON profiles (LOWER(display_name));

-- Function to get email by username (callable by anonymous users for login)
CREATE OR REPLACE FUNCTION get_email_by_username(username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT u.email INTO user_email
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE LOWER(p.display_name) = LOWER(username);

  RETURN user_email;
END;
$$;

-- Grant execute permission to anonymous users (for login)
GRANT EXECUTE ON FUNCTION get_email_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_email_by_username(TEXT) TO authenticated;
