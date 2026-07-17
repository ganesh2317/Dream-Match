# Dream Match

Dream Match is a premium, full-stack social web application where users can record and visualize their dreams, maintain daily streaks, and connect with other dreamers who share similar subconscious visions.

## Tech Stack Overview

- **Frontend**: React, Vite, Framer Motion, Vanilla CSS (Refined glassmorphic UI)
- **Backend**: Node.js, Express, Socket.io (Real-time updates)
- **Database**: PostgreSQL (Neon serverless database) & Prisma ORM

## Running the Application Locally

### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database instance

### Environment Setup

Create a `.env` file inside the `server/` directory and configure the following environment variables:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret-key"
PORT=3000
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="onboarding@resend.dev"
```

### Start the Backend Server

```bash
cd server
npm install
node index.js
```

### Start the Frontend Client

```bash
cd client
npm install
npm run dev
```

## Developer Guide

### Running Backend Tests
To run the Express backend integration tests, run the following inside the `server/` directory:
```bash
npm test
```

### Running Frontend Linter
To scan and lint the frontend React components, run the following inside the `client/` directory:
```bash
npm run lint
```

### Promoting a User to Administrator Role
To promote any existing user in the database to the `'ADMIN'` role, run the helper script inside the `server/` directory:
```bash
node promote_admin.js <username>
```
For example, to promote the user `demo`:
```bash
node promote_admin.js demo
```
