# Coding Platform

A platform for browsing and managing coding problems, built with React, Material UI, and Firebase.

## Features

- **Authentication**: User authentication handled via Firebase.
- **Problem Listing**: A comprehensive list of coding problems displayed using MUI Data Grid.
- **Secure Access**: Protected content using an `AuthWrapper` to ensure only authenticated users can access the platform.

## Tech Stack

- **Frontend**: React 19
- **UI Framework**: Material UI (MUI)
- **Backend/Auth**: Firebase
- **State Management**: `react-firebase-hooks` for seamless Firebase integration.

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd coding-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the application in development mode:
```bash
npm start
```
The app will be available at [http://localhost:3000](http://localhost:3000).

### Testing

Run the test suite:
```bash
npm test
```

## Deployment

### GitHub Pages
The project includes a script to deploy the production build to GitHub Pages:
```bash
npm run deploy
```

### Firebase
The project is configured for Firebase Hosting. You can deploy using the Firebase CLI:
```bash
firebase deploy
```

## Project Structure

- `src/firebase/`: Firebase configuration and initialization.
- `src/components/`: Reusable UI components.
    - `AuthWrapper.js`: Authentication guard.
    - `ProblemList.js`: Problem display logic.
- `src/App.js`: Main application entry point.
- `src/data.js`: Problem data and constants.
