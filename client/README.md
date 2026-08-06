# Dream Match Frontend Client

This project is the frontend client application for Dream Match built with React 19 and Vite, featuring Hot Module Replacement (HMR), Framer Motion animations, and modern CSS glassmorphism aesthetics.

## Component Overview

- `components/Feed.jsx`: Main interactive dream feed with like, bookmark, and user list modal interactions.
- `components/Profile.jsx`: User profile viewer, avatar upload, and streak metrics.
- `components/Visuals.jsx`: High-performance video & image visual feed viewer with native audio management.
- `components/Messages.jsx`: Real-time instant messaging component powered by Socket.io.
- `components/Notifications.jsx`: User activity notification center.
- `components/Search.jsx`: Instant user search with debounced querying.
- `context/AuthContext.jsx`: Global authentication and session state provider.
- `context/ThemeContext.jsx`: Theme manager supporting dark and light visual modes.

## Official Plugins & Development

Supported React Fast Refresh plugins:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

### Commands

- `npm run dev`: Launch local development server
- `npm run build`: Build production assets to `dist/`
- `npm run lint`: Run ESLint checks across source files
- `npm run preview`: Preview production build locally


