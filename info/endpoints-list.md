# ExamCraft API Endpoints List

## 1. AI-Generated Practice Quizzes

- **POST /api/quizzes/generate** - Generate quiz questions from uploaded content
- **GET /api/quizzes** - List all quizzes
- **GET /api/quizzes/{quizId}** - Get a specific quiz
- **PUT /api/quizzes/{quizId}** - Update quiz details
- **DELETE /api/quizzes/{quizId}** - Delete a quiz
- **GET /api/quizzes/{quizId}/questions** - Get questions for a specific quiz

## 2. Timed Mock Exams

- **POST /api/exams** - Create a timed mock exam
- **GET /api/exams** - List all exams
- **GET /api/exams/{examId}** - Get a specific exam
- **PUT /api/exams/{examId}** - Update exam settings
- **DELETE /api/exams/{examId}** - Delete an exam
- **POST /api/exams/{examId}/start** - Start a timed exam session
- **POST /api/exams/{examId}/submit** - Submit exam answers
- **GET /api/exams/{examId}/results** - Get exam results

## 3. Flashcard Mode

- **GET /api/users/{userId}/flashcards** - Get all flashcards for a user
- **POST /api/users/{userId}/flashcards** - Create a new flashcard
- **GET /api/users/{userId}/flashcards/{flashcardId}** - Get a specific flashcard
- **PUT /api/users/{userId}/flashcards/{flashcardId}** - Update flashcard status
- **DELETE /api/users/{userId}/flashcards/{flashcardId}** - Delete a flashcard
- **POST /api/users/{userId}/flashcards/from-questions** - Convert incorrect questions to flashcards
- **GET /api/users/{userId}/flashcards/due** - Get due flashcards based on spaced repetition

## 4. Performance Analytics Dashboard

- **GET /api/users/{userId}/analytics/overview** - Get overall performance statistics
- **GET /api/users/{userId}/analytics/topics** - Get topic-wise performance breakdown
- **GET /api/users/{userId}/analytics/time** - Get response time statistics
- **GET /api/users/{userId}/analytics/progress** - Get progress over time
- **GET /api/users/{userId}/analytics/exams/{examId}** - Get analytics for a specific exam

## 5. Question Explanations & Resources

- **GET /api/questions/{questionId}/explanation** - Get AI-generated explanation for a question
- **GET /api/questions/{questionId}/resources** - Get related resources for a question
- **POST /api/resources** - Add a new resource
- **PUT /api/resources/{resourceId}** - Update a resource
- **DELETE /api/resources/{resourceId}** - Delete a resource

## 6. User Management

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - User login
- **GET /api/users/{userId}** - Get user profile
- **PUT /api/users/{userId}** - Update user profile
- **DELETE /api/users/{userId}** - Delete user account

## Components/Schemas

1. **User** - User details
2. **Quiz** - Quiz metadata
3. **Question** - Question details with options
4. **Exam** - Exam settings and questions
5. **ExamResult** - Results of a completed exam
6. **Flashcard** - Flashcard content and spaced repetition data
7. **AnalyticsOverview** - Overall analytics data
8. **TopicAnalytics** - Topic-wise performance data
9. **TimeAnalytics** - Response time statistics
10. **Explanation** - AI-generated explanation
11. **Resource** - Educational resource metadata
