-- Migration: Add Mastery-Based Learning Fields to Flashcards
-- Run this on your existing database to add the new fields

-- Add mastery_status field with default 'learning'
ALTER TABLE flashcards 
ADD COLUMN mastery_status VARCHAR(20) NOT NULL DEFAULT 'learning';

-- Add constraint to ensure valid mastery status values
ALTER TABLE flashcards 
ADD CONSTRAINT chk_mastery_status 
CHECK (mastery_status IN ('learning', 'under_review', 'mastered'));

-- Add consecutive_correct field to track streak
ALTER TABLE flashcards 
ADD COLUMN consecutive_correct INTEGER NOT NULL DEFAULT 0;

-- Create index for faster queries on mastery status
CREATE INDEX idx_flashcards_mastery_status ON flashcards(mastery_status);

-- Create index for mastery queries by user and topic
CREATE INDEX idx_flashcards_user_mastery ON flashcards(user_id, mastery_status);

-- Update existing flashcards based on their current repetitions
-- Cards with high repetitions and ease_factor are likely mastered
UPDATE flashcards 
SET mastery_status = 'mastered', consecutive_correct = 2
WHERE repetitions >= 3 AND ease_factor >= 2.5;

-- Cards with some repetitions are under review
UPDATE flashcards 
SET mastery_status = 'under_review', consecutive_correct = 1
WHERE repetitions >= 1 AND mastery_status = 'learning';

-- Verify the migration
SELECT 
    mastery_status,
    COUNT(*) as count,
    AVG(repetitions) as avg_repetitions,
    AVG(ease_factor) as avg_ease_factor
FROM flashcards 
GROUP BY mastery_status; 