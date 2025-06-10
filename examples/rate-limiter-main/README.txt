# Unblock and Focus - AI Chat Interface with Rate Limiting

A modern React application that recreates the "Unblock and Focus" AI chat interface with context window limit warnings and smart rate limiting indicators. This application demonstrates how to handle AI model context limitations and API rate limits by providing real-time feedback to users.

## Features

### Core UI Components
- **Responsive sidebar** with conversation history organized by time periods
- **Main chat interface** with ASU branding matching the original design
- **Suggested prompts** for Learn, Practice, and Explore categories
- **Mobile-responsive design** with collapsible sidebar

### Context Window Management
- **Real-time token tracking** for conversations
- **Visual warning system** when approaching context limits (75% threshold)
- **Progress bar** showing current context window usage
- **Model switching recommendations** for higher token limits
- **"Start New Chat" quick action** to avoid truncation
- **Different warning levels** (warning at 75%, critical at 90%)

### Rate Limiting System (New Feature)
- **Smart rate limit indicator** that appears from the 11th request onwards
- **15 requests per minute** with visual countdown timer
- **Progressive UI states** (green → yellow → red) based on usage
- **Automatic UI disabling** when rate limit is reached
- **60-second reset timer** with auto-refresh
- **Clean interface** that hides indicators when not needed

### Token Usage Preview
- **Real-time token estimation** as users type (expandable/collapsible)
- **Detailed breakdown**: user input, AI response, knowledge base scan, system instructions
- **Live updates** showing total estimated tokens for the request
- **Color-coded warnings** to prevent context window overflow

### Technical Features
- **TypeScript** for type safety
- **Tailwind CSS** for modern styling
- **Mock data system** for demo purposes
- **Token estimation** simulation
- **Multiple AI model support** with different context windows

## Context Window Models Supported

- **GPT-3.5 Turbo**: 16,385 tokens
- **GPT-4**: 32,768 tokens  
- **GPT-4 Turbo**: 128,000 tokens
- **Claude-3 Sonnet**: 200,000 tokens

## Installation and Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Viewing Context Warnings

The application automatically loads with a high-token conversation to demonstrate the context warning feature. You'll see:

- A yellow warning when approaching 75% of the context window
- A red critical warning when approaching 90% of the context window
- Token usage statistics and progress bar
- Options to start a new chat or switch to a higher-capacity model

### Testing Rate Limiting

The app starts with 9 requests already used (out of 15 per minute):

1. **Send 2 more messages** to trigger the rate limit indicator (appears at 11th request)
2. **Continue sending** to reach the 15-request limit
3. **Watch the countdown timer** as it resets every minute
4. **See UI changes** as the interface becomes disabled when rate limited

### Testing Token Preview

- **Start typing** in the input box to see real-time token estimation
- **Expand/collapse** the token breakdown for detailed information
- **Watch color changes** as estimated tokens approach context limits

### Creating New Conversations

- Click the "New Chat" button in the sidebar
- Select suggested prompts from the main interface
- Switch between existing conversations in the sidebar

## File Structure

```
src/
├── components/
│   ├── ContextLimitWarning.tsx    # Context window warning component
│   ├── TokenUsagePreview.tsx      # Real-time token estimation
│   ├── RateLimitIndicator.tsx     # Smart rate limiting display
│   ├── MainContent.tsx            # Main chat interface
│   └── Sidebar.tsx                # Conversation history sidebar
├── utils/
│   └── mockData.ts                # Demo data and token utilities
├── types.ts                       # TypeScript type definitions
├── App.tsx                        # Main application component
├── index.tsx                      # React entry point
└── index.css                      # Global styles with Tailwind
```

## Key Components

### ContextLimitWarning
- Monitors token usage and displays warnings
- Shows usage percentage and progress bar
- Provides actionable recommendations
- Can be dismissed by users

### RateLimitIndicator
- Smart visibility (only shows from 11th request onwards)
- Live countdown with remaining requests
- Progressive color coding based on usage level
- Auto-reset functionality every minute

### TokenUsagePreview
- Real-time token estimation while typing
- Expandable detailed breakdown
- Color-coded warnings for context limits
- Includes knowledge base scan costs

### Token Management
- Estimates tokens based on character count (~4 chars per token)
- Tracks cumulative conversation token usage
- Supports different models with varying context windows
- Warns users before hitting limits

## Future Enhancements

For production implementation:

1. **Real API integration** with actual AI models and rate limiting
2. **Accurate token counting** using model-specific tokenizers
3. **Conversation truncation** logic for approaching limits
4. **User preferences** for warning thresholds
5. **Model auto-switching** based on conversation complexity
6. **Token usage analytics** and insights
7. **Persistent rate limit state** across sessions

## Development

Built with:
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)

The application uses mock data to simulate real AI conversations, token counting, and rate limiting. Both the context window warning system and rate limiting indicators are fully functional and demonstrate the user experience for managing API constraints in AI chat applications.
