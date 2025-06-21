# AI Flashcard Generation

## Overview

The AI Flashcard Generation feature allows users to create personalized flashcards using artificial intelligence. This system integrates with OpenRouter's API to generate educational content based on user-provided topics and materials.

## Features

- **Bulk Generation**: Create 1-50 flashcards at once
- **Difficulty Levels**: 5 levels from Beginner to Expert
- **Content Integration**: Use your own study materials as source content
- **Custom Topics**: Create flashcards for any subject
- **Smart Validation**: AI-generated content is validated for quality
- **Seamless Integration**: Works with existing spaced repetition system

## API Endpoints

### POST /api/flashcards/generate/ai

Generates flashcards using AI based on the provided parameters.

**Request Body:**

```json
{
  "user_id": "string",
  "topic_id": "string (optional)",
  "custom_topic": "string (optional)",
  "topic_name": "string",
  "num_flashcards": "number (1-50)",
  "difficulty": "number (1-5)",
  "content_source": "string (optional)",
  "additional_instructions": "string (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "flashcards": [...],
  "topic_id": "string",
  "topic_name": "string",
  "generated_count": "number",
  "requested_count": "number",
  "errors": ["string"] // if any
}
```

## Performance Characteristics

### Expected Response Times

- **1-10 flashcards**: 10-20 seconds
- **11-25 flashcards**: 20-35 seconds
- **26-50 flashcards**: 30-60 seconds

### Performance Factors

1. **OpenRouter Free Model**: Using `deepseek/deepseek-r1-0528-qwen3-8b:free` has lower priority
2. **Content Complexity**: More detailed content sources increase processing time
3. **Network Latency**: API calls to OpenRouter add overhead
4. **Database Operations**: Sequential flashcard creation takes time

### Optimization Tips

- **Batch Size**: Generate 10-15 flashcards for optimal balance of speed and quantity
- **Content Source**: Provide focused, relevant content rather than very long texts
- **Clear Instructions**: Specific instructions help AI generate better results faster
- **Topic Selection**: Use existing topics when possible to avoid topic creation overhead

### Technical Optimizations Applied

- **Streaming Disabled**: `stream: false` for faster single responses
- **Top-P Sampling**: `top_p: 0.9` for more focused generation
- **Optimized Prompts**: Structured prompts reduce AI processing time
- **Error Handling**: Graceful degradation for partial failures

## Implementation Details

### AI Integration

- **Model**: DeepSeek R1 (Free tier)
- **Provider**: OpenRouter API
- **Temperature**: 0.7 for creative but consistent results
- **Max Tokens**: 4000 to handle large responses

### Database Operations

- **Atomic Creation**: Each flashcard is created individually
- **Topic Management**: Automatic topic creation for custom topics
- **Tagging System**: Auto-generated tags for organization
- **Error Recovery**: Partial success handling

### Quality Assurance

- **Content Validation**: AI responses are parsed and validated
- **Format Checking**: Ensures proper question/answer structure
- **Difficulty Consistency**: Maintains requested difficulty level
- **Educational Standards**: Focuses on active recall principles

## Usage Guidelines

### Best Practices

1. **Topic Clarity**: Use specific, well-defined topics
2. **Content Quality**: Provide clean, relevant source material
3. **Reasonable Quantities**: Start with 10-15 flashcards
4. **Clear Instructions**: Be specific about what you want

### Common Issues

- **Timeout Errors**: Reduce flashcard count or simplify content
- **Quality Issues**: Provide more specific instructions or content
- **Topic Conflicts**: Use existing topics when possible

## Troubleshooting

### Slow Performance

- **Normal**: 10-60 seconds is expected for AI generation
- **Optimization**: Use smaller batches (10-15 flashcards)
- **Content**: Reduce content source length if very long

### Generation Errors

- **Partial Success**: Some flashcards may fail while others succeed
- **Validation**: Check that topic and content are appropriate
- **Retry**: Try again with modified parameters

### API Limitations

- **Rate Limits**: OpenRouter free tier has usage limits
- **Model Availability**: Free models may have higher latency
- **Token Limits**: Very long content may be truncated

## Future Improvements

### Potential Optimizations

1. **Paid Models**: Upgrade to faster OpenRouter models
2. **Caching**: Cache common topics and patterns
3. **Batch Processing**: Optimize database operations
4. **Streaming**: Real-time flashcard display as they're generated

### Feature Enhancements

1. **Template System**: Pre-built flashcard templates
2. **Image Support**: Visual flashcards with images
3. **Audio Integration**: Pronunciation and audio cues
4. **Collaborative Features**: Share and import flashcard sets
