-- Add has_paid column to profiles table for tracking entrance fee payments
-- Admins can manually mark users as paid/unpaid

-- Add the has_paid column with default false
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_paid BOOLEAN NOT NULL DEFAULT FALSE;

-- Allow admins to update any profile's has_paid status
CREATE POLICY "Admins can update any profile has_paid status"
    ON profiles FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
