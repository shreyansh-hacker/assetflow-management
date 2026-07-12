# Running AssetFlow Application

This guide contains the step-by-step instructions to configure, launch, and troubleshoot the production-ready AssetFlow enterprise application.

---

## 1. Project Overview

AssetFlow is a capital asset and resource booking management system built using:
- **Frontend**: React 19 + TypeScript + Vite + Radix UI + Vanilla CSS
- **Backend**: Express + Node.js + JWT Auth + Prisma ORM
- **Database**: PostgreSQL (hosted inside WSL2 Ubuntu)

---

## 2. Prerequisites

Ensure you have the following installed on your machine:
1. **Node.js** (v20.x or higher)
2. **WSL2** with Ubuntu (for running the local PostgreSQL database)
3. **npm** (v10.x or higher)

---

## 3. Ports

- **Frontend Server**: `http://localhost:5173`
- **Backend API Server**: `http://localhost:3000`
- **PostgreSQL Database**: `5432`

---

## 4. Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory with the following variables:
```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/assetflow?schema=public"
JWT_SECRET="supersecretjwtkey"
PORT=3000
```

### Frontend (`.env`)
By default, the frontend points to the backend server at `http://localhost:3000/api/v1`. You can configure the simulated delay by editing `.env` or setting:
```env
VITE_API_DELAY_MS=200
```

---

## 5. Database Setup (PostgreSQL in WSL)

If you are using PostgreSQL in WSL, configure it to accept host connections from the Windows client:

1. **Edit listen addresses in `postgresql.conf`** (usually in `/etc/postgresql/16/main/postgresql.conf`):
   Set:
   ```conf
   listen_addresses = '*'
   ```

2. **Allow host credentials in `pg_hba.conf`** (usually in `/etc/postgresql/16/main/pg_hba.conf`):
   Append:
   ```conf
   host all all 0.0.0.0/0 scram-sha-256
   host all all ::/0 scram-sha-256
   ```

3. **Set password and create database**:
   Run these inside WSL:
   ```bash
   wsl -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
   wsl -u postgres psql -c "CREATE DATABASE assetflow;"
   ```

4. **Restart PostgreSQL**:
   ```bash
   wsl -u root service postgresql restart
   ```

---

## 6. Prisma Migration & Seeding

Run the following commands inside the `backend/` directory to push the schema and seed roles/admin users:

```bash
# Generate Prisma Client
npx prisma generate

# Synchronize database schema
npx prisma db push

# Seed roles and admin user
npx prisma db seed
```

---

## 7. Running the Application

### Start the Backend Server
Run inside the `backend/` directory:
```bash
npm run dev
```
Alternatively, if nodemon has local connection caches, run via WSL:
```bash
wsl sh -c "cd backend && npm run dev"
```

### Start the Frontend Client
Run in the root folder of the repository:
```bash
npm run dev
```

---

## 8. Login Credentials

You can log in to the console immediately using the seeded accounts:

| Email | Password | Role | Description |
|---|---|---|---|
| `admin@assetflow.com` | `admin123` | **Admin** | Full system capabilities (Org Setup, Audit, Reports) |

*You can also use the Signup screen on `http://localhost:5173/login` to register new Employee or Asset Manager users.*

---

## 9. Troubleshooting & Common Errors

### Error: `Can't reach database server at 127.0.0.1:5432`
- **Cause**: Node.js v17+ attempts to resolve localhost using IPv6 (`::1`).
- **Fix**: Ensure your `DATABASE_URL` uses the explicit IPv4 address `127.0.0.1` instead of `localhost`.
- **Fix**: Check if WSL PostgreSQL is listening on all interfaces using `wsl ss -tuln`. It must show `0.0.0.0:5432`.

### Error: `EADDRINUSE: address already in use :::3000`
- **Cause**: The backend server port 3000 is occupied by a lingering process.
- **Fix**: Kill the occupying process using PowerShell:
  ```powershell
  Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
  ```

---

## 10. Production Deployment

To compile the application for deployment:
1. Run `npm run build` in the root folder.
2. The generated production assets will be built in the `dist/` directory.
3. Deploy the `dist/` folder to static hosts (Netlify, Vercel, AWS S3) and host the Node/Express backend on an application server.
