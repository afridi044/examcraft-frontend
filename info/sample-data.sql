-- Sample Data for ExamCraft Dashboard Demo
-- Run this script in your Supabase SQL editor to populate test data

-- Insert sample topics
INSERT INTO topics (topic_id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Mathematics', 'Mathematical concepts and problem solving'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Computer Science', 'Programming, algorithms, and data structures'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Physics', 'Physical laws and scientific principles'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Chemistry', 'Chemical reactions and molecular structures'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Biology', 'Life sciences and biological processes')
ON CONFLICT (topic_id) DO NOTHING;

-- Insert sample questions
INSERT INTO questions (question_id, content, question_type, difficulty, topic_id) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'What is the derivative of x²?', 'multiple-choice', 2, '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440002', 'What is the time complexity of binary search?', 'multiple-choice', 3, '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440003', 'What is Newton''s second law of motion?', 'multiple-choice', 2, '550e8400-e29b-41d4-a716-446655440003'),
  ('650e8400-e29b-41d4-a716-446655440004', 'What is the chemical formula for water?', 'multiple-choice', 1, '550e8400-e29b-41d4-a716-446655440004'),
  ('650e8400-e29b-41d4-a716-446655440005', 'What is the powerhouse of the cell?', 'multiple-choice', 2, '550e8400-e29b-41d4-a716-446655440005'),
  ('650e8400-e29b-41d4-a716-446655440006', 'Is the square root of 16 equal to 4?', 'true-false', 1, '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440007', 'What sorting algorithm has O(n log n) average time complexity?', 'multiple-choice', 3, '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440008', 'What is the speed of light in vacuum?', 'fill-in-blank', 2, '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (question_id) DO NOTHING;

-- Insert sample question options
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
  ('750e8400-e29b-41d4-a716-446655440026', '650e8400-e29b-41d4-a716-446655440007', 'Insertion Sort', false)
ON CONFLICT (option_id) DO NOTHING;

-- Function to create sample data for a specific user
-- Replace 'USER_ID_HERE' with the actual user_id from your users table
CREATE OR REPLACE FUNCTION create_sample_data_for_user(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert sample quizzes
  INSERT INTO quizzes (quiz_id, user_id, title, description, topic_id, created_at) VALUES
    (uuid_generate_v4(), target_user_id, 'Calculus Basics', 'Introduction to derivatives and integrals', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '5 days'),
    (uuid_generate_v4(), target_user_id, 'Data Structures Quiz', 'Arrays, linked lists, and trees', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '3 days'),
    (uuid_generate_v4(), target_user_id, 'Physics Fundamentals', 'Basic physics concepts', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '1 day')
  ON CONFLICT (quiz_id) DO NOTHING;

  -- Insert sample exams
  INSERT INTO exams (exam_id, user_id, title, description, duration_minutes, topic_id, created_at) VALUES
    (uuid_generate_v4(), target_user_id, 'Midterm Math Exam', 'Comprehensive mathematics test', 120, '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '7 days'),
    (uuid_generate_v4(), target_user_id, 'CS Algorithm Test', 'Test on sorting and searching algorithms', 90, '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '2 days')
  ON CONFLICT (exam_id) DO NOTHING;

  -- Insert sample flashcards
  INSERT INTO flashcards (flashcard_id, user_id, question, answer, topic_id, created_at) VALUES
    (uuid_generate_v4(), target_user_id, 'What is the derivative of sin(x)?', 'cos(x)', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '4 days'),
    (uuid_generate_v4(), target_user_id, 'What is Big O notation?', 'A mathematical notation that describes the limiting behavior of a function', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '2 days'),
    (uuid_generate_v4(), target_user_id, 'What is photosynthesis?', 'The process by which plants convert light energy into chemical energy', '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '1 day')
  ON CONFLICT (flashcard_id) DO NOTHING;

  -- Insert sample user answers
  INSERT INTO user_answers (answer_id, user_id, question_id, selected_option_id, is_correct, time_taken_seconds, created_at) VALUES
    -- Correct answers
    (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', true, 15, NOW() - INTERVAL '5 days'),
    (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440005', true, 25, NOW() - INTERVAL '4 days'),
    (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440009', true, 20, NOW() - INTERVAL '3 days'),
    (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440013', true, 10, NOW() - INTERVAL '2 days'),
    (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440017', true, 18, NOW() - INTERVAL '1 day'),
    
    -- Some incorrect answers to show realistic data
    (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440022', false, 12, NOW() - INTERVAL '3 days'),
    (uuid_generate_v4(), target_user_id, '650e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440024', false, 30, NOW() - INTERVAL '2 days')
  ON CONFLICT (answer_id) DO NOTHING;

  RAISE NOTICE 'Sample data created successfully for user %', target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Instructions for use:
-- 1. First, find your user_id by running: SELECT user_id FROM users WHERE email = 'your-email@example.com';
-- 2. Then run: SELECT create_sample_data_for_user('your-user-id-here');
-- 3. Refresh your dashboard to see the data

-- Example usage (replace with your actual user_id):
-- SELECT create_sample_data_for_user('your-user-id-from-users-table');

COMMENT ON FUNCTION create_sample_data_for_user(UUID) IS 'Creates sample quiz, exam, flashcard, and answer data for testing the dashboard'; 