# React + Vite Client

This project is a React application built with Vite, featuring Hot Module Replacement (HMR) and customized ESLint rules for local development.

## Official Plugins

Currently, two official plugins are supported for React Fast Refresh:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown))
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template due to its impact on development and build performance. To configure and enable it, please refer to the [React Compiler Installation Guide](https://react.dev/learn/react-compiler/installation).

## Expanding ESLint Configuration

For production-ready applications, we recommend adopting TypeScript with type-aware lint rules. Check out the [official Vite TypeScript template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to learn how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) into your workspace.

