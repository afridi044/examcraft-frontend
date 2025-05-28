# ExamCraft Database Integration Guide

This guide explains how to use the comprehensive database integration system for ExamCraft, including TypeScript interfaces, service layer, React hooks, and utility functions.

## Table of Contents

1. [Overview](#overview)
2. [Database Types](#database-types)
3. [Database Service Layer](#database-service-layer)
4. [React Hooks](#react-hooks)
5. [API Utilities](#api-utilities)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)
8. [Error Handling](#error-handling)

## Overview

The ExamCraft database integration provides:

- **Type-safe interfaces** for all database entities
- **Service layer** with CRUD operations for all tables
- **React hooks** with React Query integration for caching and state management
- **Utility functions** for common operations, validation, and data transformation
- **Comprehensive error handling** and user feedback

## Database Types

### Core Types (`src/types/database.ts`)

All database entities have corresponding TypeScript interfaces:

```typescript
import type {
  User,
  Topic,
  Question,
  Quiz,
  Exam,
  Flashcard,
  UserAnswer,
  ExamSession,
  // ... and many more
} from "@/types/database";
```

### Input Types

For creating and updating records:

```typescript
import type {
  CreateUserInput,
  CreateQuizInput,
  CreateExamInput,
  UpdateUserInput,
  UpdateQuizInput,
  // ... etc
} from "@/types/database";
```

### Extended Types

For complex queries with relations:

```typescript
import type {
  QuestionWithOptions,
  QuizWithQuestions,
  ExamWithQuestions,
  FlashcardWithTopic,
  DashboardStats,
  RecentActivity,
  TopicProgress,
} from "@/types/database";
```

## Database Service Layer

### Basic Usage (`src/lib/database.ts`)

```typescript
import { db } from "@/lib/database";

// Get current user
const userResponse = await db.users.getCurrentUser();
if (userResponse.success) {
  const user = userResponse.data;
}

// Create a quiz
const quizResponse = await db.quizzes.createQuiz({
  user_id: userId,
  title: "My Quiz",
  description: "A sample quiz",
  topic_id: topicId,
});

// Get user's quizzes
const quizzesResponse = await db.quizzes.getUserQuizzes(userId);
```

### Available Services

- `db.users` - User management
- `db.topics` - Topic operations
- `db.questions` - Question management with options
- `db.quizzes` - Quiz operations
- `db.exams` - Exam management
- `db.answers` - User answer tracking
- `db.flashcards` - Flashcard operations
- `db.analytics` - Dashboard statistics and analytics

### Service Methods

Each service provides standard CRUD operations:

```typescript
// Example with quizzes
await db.quizzes.getUserQuizzes(userId); // Read
await db.quizzes.createQuiz(quizData); // Create
await db.quizzes.updateQuiz(quizId, updateData); // Update
await db.quizzes.deleteQuiz(quizId); // Delete
await db.quizzes.getQuizWithQuestions(quizId); // Complex read
```

## React Hooks

### Basic Hooks (`src/hooks/useDatabase.ts`)

```typescript
import {
  useCurrentUser,
  useUserQuizzes,
  useCreateQuiz,
  useDashboardStats,
  useTopics,
} from '@/hooks/useDatabase';

function MyComponent() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: quizzes } = useUserQuizzes(user?.user_id || '');
  const { data: stats } = useDashboardStats(user?.user_id || '');
  const createQuiz = useCreateQuiz();

  const handleCreateQuiz = async () => {
    await createQuiz.mutateAsync({
      user_id: user!.user_id,
      title: "New Quiz",
      description: "Quiz description",
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user?.first_name}</h1>
      <p>You have {quizzes?.length || 0} quizzes</p>
      <button onClick={handleCreateQuiz}>Create Quiz</button>
    </div>
  );
}
```

### Compound Hooks

For complex data requirements:

```typescript
import { useDashboardData, useUserContent } from '@/hooks/useDatabase';

function Dashboard() {
  const { data: user } = useCurrentUser();
  const {
    stats,
    recentActivity,
    topicProgress,
    isLoading,
    isError,
  } = useDashboardData(user?.user_id || '');

  if (isLoading) return <div>Loading dashboard...</div>;
  if (isError) return <div>Error loading dashboard</div>;

  return (
    <div>
      <StatsCards stats={stats.data} />
      <RecentActivity activities={recentActivity.data} />
      <TopicProgress progress={topicProgress.data} />
    </div>
  );
}
```

### Mutation Hooks

For data modifications:

```typescript
import {
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
  useSubmitAnswer,
} from '@/hooks/useDatabase';

function QuizManager() {
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();
  const deleteQuiz = useDeleteQuiz();

  const handleCreate = async (data: CreateQuizInput) => {
    try {
      const result = await createQuiz.mutateAsync(data);
      if (result.success) {
        toast.success('Quiz created successfully!');
      }
    } catch (error) {
      toast.error('Failed to create quiz');
    }
  };

  return (
    <div>
      {/* Quiz management UI */}
    </div>
  );
}
```

## API Utilities

### Validation (`src/lib/api-utils.ts`)

```typescript
import { apiUtils } from "@/lib/api-utils";

// Validate quiz data
const validation = apiUtils.validation.validateQuiz({
  title: "My Quiz",
  user_id: userId,
});

if (!validation.isValid) {
  console.log("Validation errors:", validation.errors);
}

// Validate email
const isValidEmail = apiUtils.validation.validateEmail("user@example.com");
```

### Data Transformation

```typescript
// Transform question for display
const transformedQuestion = apiUtils.transform.transformQuestion(question);
console.log(transformedQuestion.topicName);
console.log(transformedQuestion.hasExplanation);

// Transform quiz for display
const transformedQuiz = apiUtils.transform.transformQuiz(quiz);
console.log(transformedQuiz.questionCount);
console.log(transformedQuiz.createdDate);
```

### Calculations

```typescript
// Calculate quiz score
const score = apiUtils.calculation.calculateQuizScore(userAnswers);
console.log(`Score: ${score.correct}/${score.total} (${score.percentage}%)`);

// Calculate next flashcard review
const review = apiUtils.calculation.calculateNextReviewDate(
  currentInterval,
  easeFactor,
  quality
);
```

### Formatting

```typescript
// Format duration
const duration = apiUtils.format.formatDuration(3665); // "1h 1m 5s"

// Format relative time
const timeAgo = apiUtils.format.formatRelativeTime(date); // "2 hours ago"

// Format score
const scoreText = apiUtils.format.formatScore(8, 10); // "8/10 (80%)"
```

### Search and Filter

```typescript
// Search questions
const filteredQuestions = apiUtils.search.searchQuestions(
  questions,
  "javascript"
);

// Filter questions by criteria
const filtered = apiUtils.search.filterQuestions(questions, {
  topicId: "topic-123",
  difficulty: 3,
  questionType: "multiple-choice",
});

// Sort questions
const sorted = apiUtils.search.sortQuestions(questions, "difficulty", "desc");
```

## Usage Examples

### Creating a Quiz with Questions

```typescript
import { db } from "@/lib/database";
import { useCreateQuiz, useCreateQuestion } from "@/hooks/useDatabase";

async function createQuizWithQuestions() {
  // 1. Create the quiz
  const quizResponse = await db.quizzes.createQuiz({
    user_id: userId,
    title: "JavaScript Basics",
    description: "Test your JavaScript knowledge",
    topic_id: topicId,
  });

  if (!quizResponse.success) {
    throw new Error("Failed to create quiz");
  }

  const quiz = quizResponse.data!;

  // 2. Create questions
  const questionData = {
    content: "What is the output of console.log(typeof null)?",
    question_type: "multiple-choice" as const,
    difficulty: 2,
    topic_id: topicId,
  };

  const optionsData = [
    { content: "null", is_correct: false },
    { content: "object", is_correct: true },
    { content: "undefined", is_correct: false },
    { content: "string", is_correct: false },
  ];

  const questionResponse = await db.questions.createQuestionWithOptions(
    questionData,
    optionsData.map((opt) => ({ ...opt, question_id: "" }))
  );

  // 3. Add questions to quiz
  if (questionResponse.success) {
    await db.quizzes.addQuestionsToQuiz(quiz.quiz_id, [
      questionResponse.data!.question_id,
    ]);
  }
}
```

### Taking a Quiz

```typescript
import { useSubmitAnswer } from '@/hooks/useDatabase';

function QuizTaking({ quiz }: { quiz: QuizWithQuestions }) {
  const submitAnswer = useSubmitAnswer();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');

  const currentQuestion = quiz.quiz_questions[currentQuestionIndex];

  const handleSubmitAnswer = async () => {
    const startTime = Date.now();

    await submitAnswer.mutateAsync({
      user_id: userId,
      question_id: currentQuestion.question_id,
      quiz_id: quiz.quiz_id,
      selected_option_id: selectedOption,
      is_correct: checkIfCorrect(selectedOption),
      time_taken_seconds: Math.floor((Date.now() - startTime) / 1000),
    });

    // Move to next question
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedOption('');
  };

  return (
    <div>
      <h2>{currentQuestion.questions.content}</h2>
      {currentQuestion.questions.question_options.map(option => (
        <label key={option.option_id}>
          <input
            type="radio"
            value={option.option_id}
            checked={selectedOption === option.option_id}
            onChange={(e) => setSelectedOption(e.target.value)}
          />
          {option.content}
        </label>
      ))}
      <button onClick={handleSubmitAnswer}>Submit Answer</button>
    </div>
  );
}
```

### Dashboard with Real-time Data

```typescript
import { useDashboardData } from '@/hooks/useDatabase';

function Dashboard() {
  const { data: user } = useCurrentUser();
  const {
    stats,
    recentActivity,
    topicProgress,
    isLoading,
  } = useDashboardData(user?.user_id || '');

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="dashboard">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Quizzes"
          value={stats.data?.totalQuizzes || 0}
          icon={<QuizIcon />}
        />
        <StatCard
          title="Average Score"
          value={`${stats.data?.averageScore || 0}%`}
          icon={<ScoreIcon />}
        />
        <StatCard
          title="Study Streak"
          value={`${stats.data?.studyStreak || 0} days`}
          icon={<StreakIcon />}
        />
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        {recentActivity.data?.map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      {/* Topic Progress */}
      <div className="topic-progress">
        <h3>Topic Progress</h3>
        {topicProgress.data?.map(progress => (
          <ProgressBar
            key={progress.topic_id}
            label={progress.topic_name}
            percentage={progress.progress_percentage}
          />
        ))}
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Always Handle Loading and Error States

```typescript
function MyComponent() {
  const { data, isLoading, isError, error } = useUserQuizzes(userId);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;

  return <QuizList quizzes={data} />;
}
```

### 2. Use Optimistic Updates for Better UX

```typescript
const updateQuiz = useUpdateQuiz();

const handleUpdate = async (quizId: string, data: UpdateQuizInput) => {
  try {
    await updateQuiz.mutateAsync({ quizId, data });
    toast.success("Quiz updated successfully!");
  } catch (error) {
    toast.error("Failed to update quiz");
  }
};
```

### 3. Validate Data Before Submission

```typescript
import { apiUtils } from "@/lib/api-utils";

const handleCreateQuiz = async (formData: any) => {
  const validation = apiUtils.validation.validateQuiz(formData);

  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }

  // Proceed with creation
  await createQuiz.mutateAsync(formData);
};
```

### 4. Use Compound Hooks for Complex Data

```typescript
// Instead of multiple individual hooks
const { stats, recentActivity, topicProgress } = useDashboardData(userId);

// Rather than
const stats = useDashboardStats(userId);
const recentActivity = useRecentActivity(userId);
const topicProgress = useTopicProgress(userId);
```

### 5. Leverage React Query Features

```typescript
// Prefetch data for better performance
const prefetchUserData = usePrefetchUserData();

useEffect(() => {
  if (user?.user_id) {
    prefetchUserData(user.user_id);
  }
}, [user?.user_id, prefetchUserData]);

// Invalidate data when needed
const invalidateUserData = useInvalidateUserData();

const handleSignOut = async () => {
  await authUtils.signOut();
  invalidateUserData(userId);
};
```

## Error Handling

### Service Layer Errors

All service methods return a consistent response format:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Usage
const response = await db.users.getCurrentUser();
if (!response.success) {
  console.error("Error:", response.error);
  return;
}

const user = response.data; // Type-safe access
```

### React Hook Errors

```typescript
const { data, isError, error } = useUserQuizzes(userId);

if (isError) {
  // error is typed as Error
  console.error("Failed to load quizzes:", error.message);
}
```

### Utility Error Handling

```typescript
import { apiUtils } from "@/lib/api-utils";

try {
  await someOperation();
} catch (error) {
  const userFriendlyMessage = apiUtils.error.createErrorMessage(
    "save quiz",
    error
  );
  toast.error(userFriendlyMessage);
}
```

## Environment Variables

Make sure you have the following environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Conclusion

This comprehensive database integration system provides:

- **Type safety** throughout your application
- **Consistent API** for all database operations
- **Automatic caching** and state management with React Query
- **Comprehensive utilities** for common operations
- **Error handling** and user feedback
- **Performance optimization** with prefetching and invalidation

Use this system to build robust, type-safe, and performant features in your ExamCraft application.
