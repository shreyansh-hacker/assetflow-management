# AssetFlow Backend

Production-ready backend for AssetFlow ERP system. Built for Odoo Hackathon 2026.

## Technologies Used
- Node.js & Express
- PostgreSQL
- Prisma ORM
- JWT Authentication

## Setup Instructions

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment:
   Copy `.env.example` to `.env` and set your `DATABASE_URL`.

3. Database migration & generation:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. Seed the database:
   ```bash
   node prisma/seed.js
   ```

5. Run the server:
   ```bash
   npm run dev
   ```

Server will start at `http://localhost:3000`.

## Architecture
- `src/controllers`: Request handlers
- `src/services`: Business logic & database interaction
- `src/routes`: Express routers
- `src/middleware`: Auth and role-based access control
- `src/validators`: Request payload validation
