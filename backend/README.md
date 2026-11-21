This service turns text into summaries and scripts for videos.

# CSpark Content Studio backend

This is the alternative Python backend. The main Next.js app uses its own API routes, so this service is not required for the default setup. See the [project guide](../README.md).

## Features

- Summaries, YouTube scripts and short-form video scripts.
- Turkish and English, with automatic language detection.
- Tone settings: formal, casual or energetic.
- Length settings: short, medium or long.

## API Endpoints

- `GET /health` - Health check
- `POST /generate` - Generate content

### Generate Content

```bash
curl -X POST "https://your-space.hf.space/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your input text here",
    "task": "summary",
    "tone": "casual",
    "length": "medium",
    "lang": "auto"
  }'
```

## Deployment

This app is designed to run on Hugging Face Spaces with the following configuration:

1. **SDK**: `fastapi`
2. **Python Version**: `3.10`
3. **App File**: `app.py`
4. **Requirements**: See `requirements.txt`

### Environment Variables

- `HF_API_TOKEN`: Your Hugging Face API token (set in Space secrets)

## Usage with Frontend

The earlier Vercel frontend setup used the following variable to call this service. The current frontend uses relative Next.js API routes instead:

```javascript
NEXT_PUBLIC_API_BASE=https://your-space.hf.space
```

## Models Used

- **Text Generation**: `mistralai/Mistral-7B-Instruct-v0.3`
- Supports Turkish and English content generation
- Separate prompts for each content type

## License

MIT License
