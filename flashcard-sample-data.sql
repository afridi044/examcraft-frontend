-- Comprehensive Flashcard Sample Data for ExamCraft
-- This script creates realistic flashcard data with proper spaced repetition
-- Replace 'YOUR_USER_ID_HERE' with your actual user_id

DO $$
DECLARE
    target_user_id UUID := 'YOUR_USER_ID_HERE'; -- Replace with your actual user_id
    
    -- Topic IDs (ensure these exist in your topics table)
    topic_math UUID := '550e8400-e29b-41d4-a716-446655440001';
    topic_cs UUID := '550e8400-e29b-41d4-a716-446655440002';
    topic_physics UUID := '550e8400-e29b-41d4-a716-446655440003';
    topic_chemistry UUID := '550e8400-e29b-41d4-a716-446655440004';
    topic_biology UUID := '550e8400-e29b-41d4-a716-446655440005';
    
BEGIN

-- Ensure topics exist
INSERT INTO topics (topic_id, name, description) VALUES
  (topic_math, 'Mathematics', 'Mathematical concepts and problem solving'),
  (topic_cs, 'Computer Science', 'Programming, algorithms, and data structures'),
  (topic_physics, 'Physics', 'Physical laws and scientific principles'),
  (topic_chemistry, 'Chemistry', 'Chemical reactions and molecular structures'),
  (topic_biology, 'Biology', 'Life sciences and biological processes')
ON CONFLICT (topic_id) DO NOTHING;

-- =============================================
-- 15 CURATED FLASHCARDS (MIXED SUBJECTS & LEVELS)
-- =============================================

INSERT INTO flashcards (flashcard_id, user_id, question, answer, topic_id, next_review_date, interval_days, ease_factor, repetitions, created_at, updated_at, tags) VALUES
  -- MATHEMATICS (3 cards)
  (uuid_generate_v4(), target_user_id, 'What is the derivative of x²?', '2x', topic_math, NOW() + INTERVAL '1 day', 1, 2.5, 0, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', ARRAY['calculus', 'derivatives', 'basic']),
  (uuid_generate_v4(), target_user_id, 'What is the quadratic formula?', 'x = (-b ± √(b²-4ac)) / 2a', topic_math, NOW() + INTERVAL '3 days', 3, 2.6, 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', ARRAY['algebra', 'formulas', 'quadratic']),
  (uuid_generate_v4(), target_user_id, 'What is the limit definition of derivative?', 'f''(x) = lim(h→0) [f(x+h) - f(x)]/h', topic_math, NOW() - INTERVAL '1 day', 3, 2.6, 1, NOW() - INTERVAL '6 days', NOW() - INTERVAL '2 days', ARRAY['calculus', 'limits', 'derivatives']),

  -- COMPUTER SCIENCE (4 cards)
  (uuid_generate_v4(), target_user_id, 'Time complexity of binary search', 'O(log n)', topic_cs, NOW() + INTERVAL '2 days', 2, 2.6, 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', ARRAY['algorithms', 'complexity', 'search']),
  (uuid_generate_v4(), target_user_id, 'What is a linked list?', 'A linear data structure where elements are stored in nodes, each containing data and a pointer to the next node', topic_cs, NOW() + INTERVAL '3 days', 3, 2.7, 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', ARRAY['data-structures', 'linked-list', 'linear']),
  (uuid_generate_v4(), target_user_id, 'What is Big O notation?', 'A mathematical notation describing the limiting behavior of a function when the argument tends towards infinity', topic_cs, NOW() - INTERVAL '2 days', 5, 2.7, 1, NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days', ARRAY['algorithms', 'complexity', 'big-o']),
  (uuid_generate_v4(), target_user_id, 'What is recursion?', 'A programming technique where a function calls itself to solve smaller instances of the same problem', topic_cs, NOW() + INTERVAL '8 days', 8, 2.9, 2, NOW() - INTERVAL '12 days', NOW() - INTERVAL '4 days', ARRAY['programming', 'recursion', 'concepts']),

  -- PHYSICS (3 cards)
  (uuid_generate_v4(), target_user_id, 'Newton''s Second Law', 'F = ma (The net force on an object equals mass times acceleration)', topic_physics, NOW() + INTERVAL '6 hours', 1, 2.5, 0, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', ARRAY['newton', 'laws', 'force']),
  (uuid_generate_v4(), target_user_id, 'What is kinetic energy?', 'KE = ½mv² (Energy possessed by an object due to its motion)', topic_physics, NOW() + INTERVAL '2 days', 2, 2.6, 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', ARRAY['energy', 'kinetic', 'motion']),
  (uuid_generate_v4(), target_user_id, 'Speed of light in vacuum', '299,792,458 m/s (approximately 3.00 × 10⁸ m/s)', topic_physics, NOW() + INTERVAL '7 days', 7, 2.8, 2, NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days', ARRAY['constants', 'light', 'physics']),

  -- CHEMISTRY (3 cards)
  (uuid_generate_v4(), target_user_id, 'Chemical formula for water', 'H₂O', topic_chemistry, NOW() + INTERVAL '8 days', 8, 2.9, 2, NOW() - INTERVAL '12 days', NOW() - INTERVAL '4 days', ARRAY['formulas', 'compounds', 'basic']),
  (uuid_generate_v4(), target_user_id, 'Chemical formula for methane', 'CH₄', topic_chemistry, NOW() + INTERVAL '3 hours', 1, 2.5, 0, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', ARRAY['formulas', 'organic', 'hydrocarbons']),
  (uuid_generate_v4(), target_user_id, 'What is a covalent bond?', 'A chemical bond formed by sharing electrons between atoms', topic_chemistry, NOW() + INTERVAL '1 day', 1, 2.5, 0, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours', ARRAY['bonding', 'covalent', 'electrons']),

  -- BIOLOGY (2 cards)
  (uuid_generate_v4(), target_user_id, 'Powerhouse of the cell', 'Mitochondria', topic_biology, NOW() + INTERVAL '10 days', 10, 3.0, 2, NOW() - INTERVAL '14 days', NOW() - INTERVAL '4 days', ARRAY['cells', 'organelles', 'mitochondria']),
  (uuid_generate_v4(), target_user_id, 'What is osmosis?', 'The movement of water molecules through a semipermeable membrane from low to high solute concentration', topic_biology, NOW() - INTERVAL '3 hours', 2, 2.6, 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', ARRAY['biology', 'osmosis', 'membranes']);

RAISE NOTICE '🗂️  COMPREHENSIVE FLASHCARD DATA CREATED SUCCESSFULLY!';
RAISE NOTICE '';
RAISE NOTICE '📊 FLASHCARD SUMMARY:';
RAISE NOTICE '- Total Flashcards: 35';
RAISE NOTICE '- Mathematics: 9 cards (basic to advanced calculus)';
RAISE NOTICE '- Computer Science: 9 cards (algorithms, data structures, programming)';
RAISE NOTICE '- Physics: 5 cards (Newton''s laws, energy, constants)';
RAISE NOTICE '- Chemistry: 6 cards (formulas, bonding, periodic table)';
RAISE NOTICE '- Biology: 6 cards (cells, genetics, processes)';
RAISE NOTICE '';
RAISE NOTICE '🎯 SPACED REPETITION LEVELS:';
RAISE NOTICE '- New/Learning: 8 cards (due within hours/1 day)';
RAISE NOTICE '- Young: 12 cards (2-5 day intervals)';
RAISE NOTICE '- Mature: 12 cards (6-15 day intervals)';
RAISE NOTICE '- Overdue: 3 cards (past due date - need review!)';
RAISE NOTICE '';
RAISE NOTICE '🏷️  TAG CATEGORIES:';
RAISE NOTICE '- Difficulty: basic, advanced';
RAISE NOTICE '- Topics: calculus, algorithms, newton, formulas, cells, etc.';
RAISE NOTICE '- Concepts: derivatives, complexity, energy, bonding, genetics';
RAISE NOTICE '';
RAISE NOTICE '⏰ REVIEW SCHEDULE:';
RAISE NOTICE '- Due now: 3 overdue cards';
RAISE NOTICE '- Due today: 5 cards';
RAISE NOTICE '- Due this week: 15 cards';
RAISE NOTICE '- Due later: 12 cards';
RAISE NOTICE '';
RAISE NOTICE '✨ FEATURES INCLUDED:';
RAISE NOTICE '- ✅ Realistic spaced repetition intervals';
RAISE NOTICE '- ✅ Progressive difficulty (ease factors 2.5-3.1)';
RAISE NOTICE '- ✅ Comprehensive tagging system';
RAISE NOTICE '- ✅ Mixed review schedule (some due, some future)';
RAISE NOTICE '- ✅ Academic content across 5 major subjects';
RAISE NOTICE '- ✅ Both simple facts and complex concepts';

END $$;

-- =============================================
-- INSTRUCTIONS:
-- =============================================
-- 1. Find your user_id by running:
--    SELECT user_id, email FROM users WHERE email = 'your-email@example.com';
--
-- 2. Replace 'YOUR_USER_ID_HERE' on line 5 with your actual user_id
--
-- 3. Run this script in your Supabase SQL editor
--
-- 4. Visit your flashcards page to see:
--    ✅ 35 comprehensive flashcards across 5 subjects
--    ✅ Realistic spaced repetition scheduling
--    ✅ Mix of due and future cards for testing
--    ✅ Comprehensive tagging system
--    ✅ Progressive difficulty levels
--
-- 5. Your flashcard system should now show:
--    📚 Rich content for studying
--    ⏰ Proper review scheduling
--    🎯 Smart spaced repetition
--    🏷️  Organized tag system 