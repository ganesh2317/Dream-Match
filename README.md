# Dream Match

Dream Match is a premium, full-stack social web application where users can record and visualize their dreams, maintain daily streaks, and connect with other dreamers who share similar subconscious visions.

## Tech Stack Overview

- **Frontend**: React, Vite, Framer Motion, Vanilla CSS (Refined glassmorphic UI)
- **Backend**: Node.js, Express, Socket.io (Real-time updates)
- **Database**: PostgreSQL (Neon serverless database) & Prisma ORM

---

## Project Structure

The project is structured into a client frontend and a server backend:

```text
.
├── client/                 # Frontend React Application
│   ├── src/                # Source code
│   │   ├── components/     # React UI components (Feed, Profile, Matches, etc.)
│   │   ├── pages/          # Page components (Admin, Dashboard, Login, Register)
│   │   ├── context/        # React Context (Auth context, Socket context)
│   │   ├── utils/          # Utility scripts and helpers
│   │   └── main.jsx        # React application entry point
│   ├── package.json        # Client dependencies & scripts
│   └── vite.config.js      # Vite configuration
│
├── server/                 # Backend Node.js / Express Application
│   ├── src/                # Backend Source code
│   │   ├── controllers/    # API endpoint controller logic
│   │   ├── middleware/     # Authentication & role-based middleware
│   │   ├── routes/         # Express API routes
│   │   ├── services/       # Video generation background worker
│   │   └── utils/          # Database client and system utilities
│   ├── prisma/             # Prisma Schema (`schema.prisma`) & SQLite fallback
│   ├── package.json        # Server dependencies & scripts
│   └── index.js            # Express server & Socket.io entry point
└── README.md               # Main documentation file
```

---

## Running the Application Locally

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **PostgreSQL** database instance (optional for development, as a SQLite fallback is integrated when using Vercel or when a connection string is not provided)

### Environment Setup

Create a `.env` file inside the `server/` directory and configure the following environment variables:

```env
# Required Variables
DATABASE_URL="your-postgresql-connection-string" # Defaults to fallback development DB if not specified
JWT_SECRET="your-jwt-secret-key"                 # Defaults to 'dream-secret' if not specified

# Optional Server Configuration
PORT=3000                                       # Port backend server listens on (defaults to 3000)
FRONTEND_URL="http://localhost:5173"             # URL of the client frontend for CORS configuration
NODE_ENV="development"                          # 'development', 'production', or 'test'

# Optional Visual Generation API Keys (used for generating high-fidelity dream visuals)
TOGETHER_API_KEY="your-together-api-key"
FAL_KEY="your-fal-api-key"
OPENAI_API_KEY="your-openai-api-key"
REPLICATE_API_TOKEN="your-replicate-token"
HUGGINGFACE_TOKEN="your-huggingface-token"
STABILITY_API_KEY="your-stability-api-key"
VIDEO_PROVIDER="luma"                           # Luma AI video generation provider ('luma', etc.)
```

### Start the Backend Server

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Push database schema to database:
   ```bash
   npx prisma db push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Start the Frontend Client

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

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

