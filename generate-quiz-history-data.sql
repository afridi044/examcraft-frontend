-- Generate Quiz History Data for ExamCraft
-- This script creates realistic quiz attempts with proper quiz-answer relationships
-- Replace 'YOUR_USER_ID_HERE' with your actual user_id

DO $$
DECLARE
    target_user_id UUID := 'YOUR_USER_ID_HERE'; -- Replace with your actual user_id
    quiz1_id UUID := uuid_generate_v4();
    quiz2_id UUID := uuid_generate_v4();
    quiz3_id UUID := uuid_generate_v4();
    quiz4_id UUID := uuid_generate_v4();
    quiz5_id UUID := uuid_generate_v4();
BEGIN

-- Ensure topics exist
INSERT INTO topics (topic_id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Mathematics', 'Mathematical concepts and problem solving'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Computer Science', 'Programming, algorithms, and data structures'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Physics', 'Physical laws and scientific principles'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Chemistry', 'Chemical reactions and molecular structures'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Biology', 'Life sciences and biological processes')
ON CONFLICT (topic_id) DO NOTHING;

-- Ensure questions exist
INSERT INTO questions (question_id, content, question_type, difficulty, topic_id) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'What is the derivative of x²?', 'multiple-choice', 2, '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440002', 'What is the time complexity of binary search?', 'multiple-choice', 3, '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440003', 'What is Newton''s second law of motion?', 'multiple-choice', 2, '550e8400-e29b-41d4-a716-446655440003'),
  ('650e8400-e29b-41d4-a716-446655440004', 'What is the chemical formula for water?', 'multiple-choice', 1, '550e8400-e29b-41d4-a716-446655440004'),
  ('650e8400-e29b-41d4-a716-446655440005', 'What is the powerhouse of the cell?', 'multiple-choice', 2, '550e8400-e29b-41d4-a716-446655440005'),
  ('650e8400-e29b-41d4-a716-446655440006', 'Is the square root of 16 equal to 4?', 'true-false', 1, '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440007', 'What sorting algorithm has O(n log n) average time complexity?', 'multiple-choice', 3, '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440008', 'What is the speed of light in vacuum?', 'fill-in-blank', 2, '550e8400-e29b-41d4-a716-446655440003'),
  ('650e8400-e29b-41d4-a716-446655440009', 'What is the integral of 2x?', 'multiple-choice', 2, '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440010', 'What is a linked list?', 'multiple-choice', 2, '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (question_id) DO NOTHING;

-- Ensure question options exist
INSERT INTO question_options (option_id, question_id, content, is_correct) VALUES
  -- Options for derivative question
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '2x', true),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'x', false),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', '2x²', false),
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'x²', false),
  
  -- Options for binary search question
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440002', 'O(log n)', true),
  ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', 'O(n)', false),
  ('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', 'O(n²)', false),
  ('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440002', 'O(1)', false),
  
  -- Options for Newton's law question
  ('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440003', 'F = ma', true),
  ('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440003', 'E = mc²', false),
  ('750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440003', 'F = G(m₁m₂)/r²', false),
  ('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440003', 'v = u + at', false),
  
  -- Options for water formula question
  ('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440004', 'H₂O', true),
  ('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440004', 'CO₂', false),
  ('750e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440004', 'NaCl', false),
  ('750e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440004', 'CH₄', false),
  
  -- Options for cell powerhouse question
  ('750e8400-e29b-41d4-a716-446655440017', '650e8400-e29b-41d4-a716-446655440005', 'Mitochondria', true),
  ('750e8400-e29b-41d4-a716-446655440018', '650e8400-e29b-41d4-a716-446655440005', 'Nucleus', false),
  ('750e8400-e29b-41d4-a716-446655440019', '650e8400-e29b-41d4-a716-446655440005', 'Ribosome', false),
  ('750e8400-e29b-41d4-a716-446655440020', '650e8400-e29b-41d4-a716-446655440005', 'Chloroplast', false),
  
  -- Options for true/false question
  ('750e8400-e29b-41d4-a716-446655440021', '650e8400-e29b-41d4-a716-446655440006', 'True', true),
  ('750e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440006', 'False', false),
  
  -- Options for sorting algorithm question
  ('750e8400-e29b-41d4-a716-446655440023', '650e8400-e29b-41d4-a716-446655440007', 'Merge Sort', true),
  ('750e8400-e29b-41d4-a716-446655440024', '650e8400-e29b-41d4-a716-446655440007', 'Bubble Sort', false),
  ('750e8400-e29b-41d4-a716-446655440025', '650e8400-e29b-41d4-a716-446655440007', 'Selection Sort', false),
  ('750e8400-e29b-41d4-a716-446655440026', '650e8400-e29b-41d4-a716-446655440007', 'Insertion Sort', false),
  
  -- Options for integral question
  ('750e8400-e29b-41d4-a716-446655440027', '650e8400-e29b-41d4-a716-446655440009', 'x² + C', true),
  ('750e8400-e29b-41d4-a716-446655440028', '650e8400-e29b-41d4-a716-446655440009', '2x + C', false),
  ('750e8400-e29b-41d4-a716-446655440029', '650e8400-e29b-41d4-a716-446655440009', 'x + C', false),
  ('750e8400-e29b-41d4-a716-446655440030', '650e8400-e29b-41d4-a716-446655440009', '2x² + C', false),
  
  -- Options for linked list question
  ('750e8400-e29b-41d4-a716-446655440031', '650e8400-e29b-41d4-a716-446655440010', 'A linear data structure with nodes', true),
  ('750e8400-e29b-41d4-a716-446655440032', '650e8400-e29b-41d4-a716-446655440010', 'A tree data structure', false),
  ('750e8400-e29b-41d4-a716-446655440033', '650e8400-e29b-41d4-a716-446655440010', 'A hash table', false),
  ('750e8400-e29b-41d4-a716-446655440034', '650e8400-e29b-41d4-a716-446655440010', 'A graph', false)
ON CONFLICT (option_id) DO NOTHING;

-- CREATE QUIZZES WITH SPECIFIC IDs
INSERT INTO quizzes (quiz_id, user_id, title, description, topic_id, created_at) VALUES
  (quiz1_id, target_user_id, 'Advanced Calculus Quiz', 'Comprehensive test on derivatives and integrals', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '7 days'),
  (quiz2_id, target_user_id, 'Data Structures & Algorithms', 'Test on arrays, linked lists, and search algorithms', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '5 days'),
  (quiz3_id, target_user_id, 'Physics Fundamentals', 'Newton''s laws and basic physics concepts', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '3 days'),
  (quiz4_id, target_user_id, 'Chemistry Basics', 'Chemical formulas and basic reactions', '550e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '2 days'),
  (quiz5_id, target_user_id, 'Biology Essentials', 'Cell structure and biological processes', '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '1 day');

-- ADD QUESTIONS TO QUIZZES
INSERT INTO quiz_questions (quiz_id, question_id, question_order) VALUES
  -- Quiz 1: Advanced Calculus (3 questions)
  (quiz1_id, '650e8400-e29b-41d4-a716-446655440001', 1),
  (quiz1_id, '650e8400-e29b-41d4-a716-446655440006', 2),
  (quiz1_id, '650e8400-e29b-41d4-a716-446655440009', 3),
  
  -- Quiz 2: Data Structures (3 questions)
  (quiz2_id, '650e8400-e29b-41d4-a716-446655440002', 1),
  (quiz2_id, '650e8400-e29b-41d4-a716-446655440007', 2),
  (quiz2_id, '650e8400-e29b-41d4-a716-446655440010', 3),
  
  -- Quiz 3: Physics (2 questions)
  (quiz3_id, '650e8400-e29b-41d4-a716-446655440003', 1),
  (quiz3_id, '650e8400-e29b-41d4-a716-446655440008', 2),
  
  -- Quiz 4: Chemistry (1 question)
  (quiz4_id, '650e8400-e29b-41d4-a716-446655440004', 1),
  
  -- Quiz 5: Biology (1 question)
  (quiz5_id, '650e8400-e29b-41d4-a716-446655440005', 1);

-- CREATE REALISTIC QUIZ ATTEMPTS WITH PROPER QUIZ_ID RELATIONSHIPS

-- Quiz 1 Attempt (Advanced Calculus) - 90% Score (3/3 correct)
INSERT INTO user_answers (answer_id, user_id, question_id, quiz_id, selected_option_id, is_correct, time_taken_seconds, created_at) VALUES
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440001', quiz1_id, '750e8400-e29b-41d4-a716-446655440001', true, 25, NOW() - INTERVAL '7 days'),
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440006', quiz1_id, '750e8400-e29b-41d4-a716-446655440021', true, 15, NOW() - INTERVAL '7 days'),
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440009', quiz1_id, '750e8400-e29b-41d4-a716-446655440027', true, 30, NOW() - INTERVAL '7 days');

-- Quiz 2 Attempt (Data Structures) - 67% Score (2/3 correct)
INSERT INTO user_answers (answer_id, user_id, question_id, quiz_id, selected_option_id, is_correct, time_taken_seconds, created_at) VALUES
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440002', quiz2_id, '750e8400-e29b-41d4-a716-446655440005', true, 35, NOW() - INTERVAL '5 days'),
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440007', quiz2_id, '750e8400-e29b-41d4-a716-446655440024', false, 45, NOW() - INTERVAL '5 days'), -- Wrong answer
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440010', quiz2_id, '750e8400-e29b-41d4-a716-446655440031', true, 20, NOW() - INTERVAL '5 days');

-- Quiz 3 Attempt (Physics) - 50% Score (1/2 correct)
INSERT INTO user_answers (answer_id, user_id, question_id, quiz_id, selected_option_id, is_correct, time_taken_seconds, created_at) VALUES
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440003', quiz3_id, '750e8400-e29b-41d4-a716-446655440009', true, 40, NOW() - INTERVAL '3 days'),
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440008', quiz3_id, NULL, false, 60, NOW() - INTERVAL '3 days'); -- Fill-in-blank, wrong answer

-- Quiz 4 Attempt (Chemistry) - 100% Score (1/1 correct)
INSERT INTO user_answers (answer_id, user_id, question_id, quiz_id, selected_option_id, is_correct, time_taken_seconds, created_at) VALUES
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440004', quiz4_id, '750e8400-e29b-41d4-a716-446655440013', true, 8, NOW() - INTERVAL '2 days');

-- Quiz 5 Attempt (Biology) - 100% Score (1/1 correct)
INSERT INTO user_answers (answer_id, user_id, question_id, quiz_id, selected_option_id, is_correct, time_taken_seconds, created_at) VALUES
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440005', quiz5_id, '750e8400-e29b-41d4-a716-446655440017', true, 12, NOW() - INTERVAL '1 day');

-- RETAKE QUIZ 2 (Improved Performance) - 100% Score (3/3 correct)
INSERT INTO user_answers (answer_id, user_id, question_id, quiz_id, selected_option_id, is_correct, time_taken_seconds, created_at) VALUES
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440002', quiz2_id, '750e8400-e29b-41d4-a716-446655440005', true, 20, NOW() - INTERVAL '12 hours'),
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440007', quiz2_id, '750e8400-e29b-41d4-a716-446655440023', true, 25, NOW() - INTERVAL '12 hours'), -- Correct this time
  (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440010', quiz2_id, '750e8400-e29b-41d4-a716-446655440031', true, 15, NOW() - INTERVAL '12 hours');

RAISE NOTICE 'Quiz history data created successfully!';
RAISE NOTICE 'Created 5 quizzes with realistic quiz attempts:';
RAISE NOTICE '- Advanced Calculus Quiz: 100%% (3/3)';
RAISE NOTICE '- Data Structures Quiz: 67%% → 100%% (retaken)';
RAISE NOTICE '- Physics Fundamentals: 50%% (1/2)';
RAISE NOTICE '- Chemistry Basics: 100%% (1/1)';
RAISE NOTICE '- Biology Essentials: 100%% (1/1)';
RAISE NOTICE 'Total quiz attempts: 6 (including 1 retake)';

END $$;

-- INSTRUCTIONS:
-- 1. Find your user_id: SELECT user_id FROM users WHERE email = 'your-email@example.com';
-- 2. Replace 'YOUR_USER_ID_HERE' in line 5 with your actual user_id
-- 3. Run this script in your Supabase SQL editor
-- 4. Refresh your quiz history page to see the data 