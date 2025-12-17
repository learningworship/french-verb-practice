-- =====================================================
-- ADD USER ROLES TO FRENCH VERB PRACTICE APP
-- =====================================================
-- Run this in Supabase SQL Editor
-- 
-- Roles:
--   'user'  - Normal user (default)
--   'admin' - Can manage verbs, view stats, ban users
-- =====================================================

-- Step 1: Add role column to profiles
-- =====================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

-- Step 2: Add is_banned column for user management
-- =====================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS banned_reason TEXT;

-- Step 3: Create function to check if user is admin
-- =====================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create function to check if user is banned
-- =====================================================
CREATE OR REPLACE FUNCTION is_banned()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND is_banned = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Update RLS policies for admin actions
-- =====================================================

-- Allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id  -- Users can see their own profile
    OR is_admin()    -- Admins can see all profiles
  );

-- Allow admins to update any profile (for banning)
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = id  -- Users can update their own profile
    OR is_admin()    -- Admins can update any profile
  );

-- Step 6: Admin policies for default_verbs table
-- =====================================================

-- Allow admins to insert default verbs
DROP POLICY IF EXISTS "Admins can insert default verbs" ON default_verbs;
CREATE POLICY "Admins can insert default verbs"
  ON default_verbs FOR INSERT
  WITH CHECK (is_admin());

-- Allow admins to update default verbs
DROP POLICY IF EXISTS "Admins can update default verbs" ON default_verbs;
CREATE POLICY "Admins can update default verbs"
  ON default_verbs FOR UPDATE
  USING (is_admin());

-- Allow admins to delete default verbs
DROP POLICY IF EXISTS "Admins can delete default verbs" ON default_verbs;
CREATE POLICY "Admins can delete default verbs"
  ON default_verbs FOR DELETE
  USING (is_admin());

-- Step 7: Create view for admin statistics
-- =====================================================
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT 
  p.id,
  p.email,
  p.display_name,
  p.role,
  p.is_banned,
  p.created_at,
  COUNT(DISTINCT uv.id) as verb_count,
  COUNT(DISTINCT ps.id) as practice_count,
  MAX(ps.created_at) as last_practice
FROM profiles p
LEFT JOIN user_verbs uv ON uv.user_id = p.id
LEFT JOIN practice_sessions ps ON ps.user_id = p.id
GROUP BY p.id, p.email, p.display_name, p.role, p.is_banned, p.created_at;

-- Grant access to the view (only admins can use it via RLS)
-- Note: Views inherit RLS from underlying tables

-- Step 8: Create function to promote user to admin
-- =====================================================
-- This should only be called by super admin or via Supabase dashboard
CREATE OR REPLACE FUNCTION promote_to_admin(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Only existing admins can promote others
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  
  UPDATE profiles 
  SET role = 'admin' 
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create function to ban user
-- =====================================================
CREATE OR REPLACE FUNCTION ban_user(target_user_id UUID, reason TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Only admins can ban users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can ban users';
  END IF;
  
  -- Cannot ban yourself
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot ban yourself';
  END IF;
  
  -- Cannot ban other admins
  IF EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Cannot ban admin users';
  END IF;
  
  UPDATE profiles 
  SET 
    is_banned = TRUE,
    banned_at = NOW(),
    banned_reason = reason
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create function to unban user
-- =====================================================
CREATE OR REPLACE FUNCTION unban_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Only admins can unban users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can unban users';
  END IF;
  
  UPDATE profiles 
  SET 
    is_banned = FALSE,
    banned_at = NULL,
    banned_reason = NULL
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MAKE YOURSELF AN ADMIN
-- =====================================================
-- Replace 'your-email@example.com' with your actual email
-- Run this AFTER running all the above

-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify everything is set up:

-- Check your role:
-- SELECT id, email, role, is_banned FROM profiles WHERE id = auth.uid();

-- Check all users (if admin):
-- SELECT * FROM admin_user_stats;

SELECT 'Roles schema created successfully!' as message;

