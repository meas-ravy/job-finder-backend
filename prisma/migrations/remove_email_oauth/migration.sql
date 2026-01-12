-- Step 1: Delete users with NULL phone values (they can't be used without phone)
DELETE FROM "User" WHERE "phone" IS NULL;

-- Step 2: Drop OAuthAccount table and its constraints first
DROP TABLE IF EXISTS "OAuthAccount" CASCADE;

-- Step 3: Drop OAuthProvider enum (no longer needed)
DROP TYPE IF EXISTS "OAuthProvider";

-- Step 4: Remove email column from User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "email";

-- Step 5: Remove passwordHash column from User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordHash";

-- Step 6: Make phone column required (non-nullable)
-- Since we deleted NULL values in step 1, this should work
ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;

-- Step 7: Drop unique constraint on email if it exists (should be gone after dropping column, but just in case)
-- This is handled automatically when dropping the column
