# GPT Marketplace Prototype

A prototype for a marketplace for GPT models, built with React, TypeScript, and Tailwind CSS.

## Features

- Browse GPT models in a visual marketplace
- Filter models by category
- Search for models by name, description, or tags
- View detailed information about each model
- Clone models for your own use

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/danielennis11111/gpt-marketplace.git
   cd gpt-marketplace
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/gpt-marketplace`

## Building for Production

To build the application for production:

```
npm run build
```

## Deployment

The application is configured for deployment to GitHub Pages:

```
npm run deploy
```

## Project Structure

The project follows a feature-based organization:

```
src/
├── features/           # Feature modules
│   ├── app/            # Core app components
│   ├── marketplace/    # Marketplace feature
│   └── projects/       # Project details feature
├── shared/             # Shared resources
│   ├── api/            # API services
│   ├── components/     # Reusable components
│   ├── data/           # Mock data
│   └── types/          # TypeScript types
└── index.css           # Global styles
```

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

## License

This project is licensed under the MIT License. 