# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Build: `npm run build`
- Start: `npm start`
- Test: `npm test`
- Deploy: `npm run deploy`
- Run a single test: `npm test -- <path-to-test-file>`

## Architecture

The project is a React application bootstrapped with Create React App, using Material UI (MUI) for styling and Firebase for authentication and data.

### Structure
- `src/firebase/`: Contains Firebase configuration and initialization (`config.js`).
- `src/components/`: UI components.
    - `AuthWrapper.js`: Handles authentication state and protects routes/content.
    - `ProblemList.js`: Main component for displaying the list of coding problems.
- `src/App.js`: Root component that integrates authentication and the problem list.
- `src/data.js`: Data constants or mock data.
- `public/`: Static assets.

### Key Technologies
- **React 19**: UI library.
- **MUI**: Component library for layout and data grids.
- **Firebase**: Backend services for Auth and potentially Firestore/Database.
- **react-firebase-hooks**: Hooks for integrating Firebase state into React.
