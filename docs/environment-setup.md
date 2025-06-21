# Environment Setup for AI Quiz Generation

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenRouter API Configuration (new - for AI quiz generation)
OPENROUTER_API_KEY=your_openrouter_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Getting Your OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Go to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

## Free Models Available

The system is configured to use free models from OpenRouter:

- **meta-llama/llama-3.1-8b-instruct:free** (default)
- **microsoft/phi-3-mini-128k-instruct:free**
- **google/gemma-2-9b-it:free**

## Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/quiz/create`
3. Fill out the quiz creation form
4. Click "Generate AI Quiz"
5. If configured correctly, the AI will generate questions and redirect you to take the quiz

## Features Implemented

✅ **AI Quiz Generation**

- Custom topics and content source
- Multiple question types (multiple-choice, true-false, fill-in-blank)
- Difficulty levels (1-5)
- Variable question count (5-50)

✅ **AI Flashcard Generation**

- Custom topics and content source
- Manual and AI-powered creation modes
- Difficulty levels (1-5)
- Variable flashcard count (1-50)
- Professional modal interface with smooth animations

✅ **Quiz Taking Interface**

- Timer functionality
- Question navigation
- Progress tracking
- Answer validation

✅ **Database Sync**

- Automatic topic creation for custom topics
- Question and answer storage
- User answer tracking with timing
- Results calculation and storage

✅ **Results Display**

- Score calculation
- Performance metrics
- Time tracking
- Navigation back to dashboard

## Troubleshooting

### "OpenRouter API key not configured" Error

- Make sure `OPENROUTER_API_KEY` is set in your `.env.local` file
- Restart your development server after adding the key

### "Failed to generate questions" Error

- Check your internet connection
- Verify your OpenRouter API key is valid
- Check the browser console for detailed error messages

### Questions Not Saving to Database

- Verify your Supabase configuration
- Check if the user is properly authenticated
- Review the network tab for failed API calls

### "Failed to generate flashcards" Error

- Check your internet connection
- Verify your OpenRouter API key is valid
- Ensure the topic name is provided
- Check the browser console for detailed error messages

### Flashcards Not Saving to Database

- Verify your Supabase configuration
- Check if the user is properly authenticated
- Ensure topic selection is valid
- Review the network tab for failed API calls

## Support

If you encounter issues:

1. Check the browser console for errors
2. Review the terminal output for server errors
3. Verify all environment variables are set correctly
4. Ensure your database schema is up to date
