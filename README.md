#  AssetFlow - Enterprise Asset & Resource Management System

<div align="center">

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748)
![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20SQLite-blueviolet)
![License](https://img.shields.io/badge/License-MIT-yellow)

### 🏆 Odoo Hackathon 2026

A full-stack Enterprise Asset & Resource Management System for efficiently managing organizational assets, employees, bookings, maintenance, audits, and reports.

</div>

---

# 📌 About the Project

AssetFlow is a modern Enterprise Asset & Resource Management System developed for the **Odoo Hackathon 2026**. It enables organizations to manage the complete lifecycle of their assets—from procurement and allocation to maintenance, audits, and retirement—through a centralized platform.

The project is divided into two major components:

- **Frontend:** React + Vite
- **Backend:** Node.js + Express + Prisma ORM

The backend exposes secure REST APIs while the frontend provides an intuitive user interface for managing enterprise assets.

---

# ❗ Problem Statement

Many organizations still rely on spreadsheets or disconnected tools for asset management, leading to:

- Asset duplication
- Double allocation
- Booking conflicts
- Poor maintenance tracking
- Missing audit history
- Manual approval processes
- Lack of accountability
- Inefficient reporting

These issues reduce operational efficiency and increase the chances of human error.

---

# 💡 Proposed Solution

AssetFlow provides a centralized digital platform that automates the complete asset lifecycle.

The system supports:

- Secure Authentication
- Role-Based Access Control (RBAC)
- Asset Allocation & Returns
- Booking Management
- Maintenance Workflow
- Audit Management
- Notifications
- Activity Logs
- Dashboard KPIs
- Reports & Analytics

---

# ✨ Key Features

## 🔐 Authentication & Security

- User Signup & Login
- JWT Authentication
- Role-Based Access Control (RBAC)
- Password Hashing using bcrypt
- Protected Routes

---

## 🏢 Organization Management

- Departments
- Categories
- Employees

---

## 💻 Asset Management

- Add, Update, Delete Assets
- Search & Pagination
- Status & Department Filters
- Asset Lifecycle Tracking

---

## 📦 Allocation Management

- Allocate Assets
- Return Assets
- Transfer Requests
- Approval Workflow

---

## 📅 Booking System

- Asset Reservations
- Booking Updates
- Prevent Overlapping Bookings

---

## 🔧 Maintenance

- Maintenance Requests
- Approval/Rejection
- Resolution Tracking

---

## 📋 Audit

- Create Audit Cycles
- Verify Assets
- Close Audits
- Mark Lost Assets

---

## 📊 Dashboard & Reports

- Available Assets
- Allocated Assets
- Maintenance Overview
- Active Bookings
- Pending Transfers
- Utilization Reports

---

## 🔔 Notifications & Activity Logs

- Asset Assigned
- Booking Created
- Transfer Approved
- Maintenance Approved
- Audit Closed
- Overdue Returns

Every important action is logged for accountability.

---

# 🛠️ Technology Stack

| Frontend | Backend | Database |
|-----------|----------|-----------|
| React.js | Node.js | PostgreSQL |
| Vite | Express.js | SQLite (Development) |
| React Router | Prisma ORM | |
| Tailwind CSS | JWT | |
| Axios | bcrypt | |

---

# 🏗️ System Architecture

```text
                React Frontend
                      │
             Axios API Requests
                      │
                      ▼
               Express REST APIs
                      │
               Authentication
                      │
               Business Logic
                      │
                 Prisma ORM
                      │
          PostgreSQL / SQLite Database
```

---

# 📂 Project Structure

```text
AssetFlow/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── API_DOCS.md
│   ├── package.json
│   └── README.md
│
├── docs/
├── screenshots/
└── README.md
```

---

# 📦 Modules

- Authentication
- Dashboard
- Departments
- Categories
- Employees
- Asset Management
- Asset Allocation
- Booking
- Maintenance
- Audit
- Reports
- Notifications
- Activity Logs

---

# 👥 User Roles

| Role | Permissions |
|------|-------------|
| Admin | Full System Access |
| Asset Manager | Manage Assets & Allocations |
| Department Head | Department-Level Management |
| Employee | Book & View Assigned Assets |

---

# 🗄️ Database Design

The backend follows a normalized relational database.

Main Tables:

- Users
- Roles
- Departments
- Categories
- Assets
- AssetAllocations
- Bookings
- TransferRequests
- MaintenanceRequests
- AuditCycles
- AuditItems
- Notifications
- ActivityLogs

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/<your-username>/AssetFlow.git
```

---

## Backend Setup

```bash
cd backend

npm install

npx prisma generate

npx prisma migrate dev --name init

node prisma/seed.js

npm run dev
```

---

## Frontend Setup

```bash
# Frontend resides in the root directory of this repository
npm install

npm run dev
```

---

# 🔑 Environment Variables

## Backend

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"

JWT_SECRET="your_secret_key"

PORT=3000
```

For PostgreSQL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/assetflow?schema=public"
```

---

## Frontend

```env
VITE_API_URL=http://localhost:3000/api
```

---

# 🚀 Running the Project

### Backend

```bash
cd backend

npm run dev
```

Runs at:

```
http://localhost:3000
```

---

### Frontend

```bash
# Run in root directory
npm run dev
```

Runs at:

```
http://localhost:5173
```

---

# 📚 API Documentation

Backend API documentation is available in:

```
backend/API_DOCS.md
```

Postman Collection is also included inside the backend project.<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d5eff171-f737-44f4-86c6-ed157d67dae3" />


Example:

```md
![Dashboard](screenshots/dashboard.png)

---

# 🔮 Future Scope

- QR Code Based Asset Tracking
- RFID Integration
- Mobile Application
- Email Notifications
- WebSocket Notifications
- Docker Deployment
- CI/CD Pipeline
- AI-Based Asset Analytics
- Cloud Deployment (AWS/Azure/GCP)

---

#  License

This project was developed as part of the **Odoo Hackathon 2026** for educational and demonstration purposes.

<div align="center">


</div>



  

<img width="1600" height="724" alt="Dashboard 1" src="https://github.com/user-attachments/assets/b2f97bb0-bd97-43d9-aac8-643986f435b4" />

<img width="1600" height="726" alt="Dashboard 2" src="https://github.com/user-attachments/assets/ee4e800e-f33a-4ace-b7e6-3fb80d3526fa" />

<img width="1600" height="728" alt="Dashboard 3" src="https://github.com/user-attachments/assets/3a8f98bb-6e3c-4367-8fdf-d49f4f33cc5d" />

<img width="1920" height="1080" alt="Screenshot 464" src="https://github.com/user-attachments/assets/29108351-fac9-4fc2-958c-4ab8a19cb9dc" />

<img width="1920" height="1080" alt="Screenshot 465" src="https://github.com/user-attachments/assets/5c707b4e-f631-4b72-838f-932620f6bede" />

<img width="1920" height="1080" alt="Screenshot 466" src="https://github.com/user-attachments/assets/6fbbf781-0a82-40cd-9efe-f0f5c9105c20" />

<img width="1920" height="1080" alt="Screenshot 467" src="https://github.com/user-attachments/assets/4172f012-9b5d-4938-9e8b-5a5b53ea0a8c" />

<img width="1920" height="1080" alt="Screenshot 468" src="https://github.com/user-attachments/assets/0360eb05-5407-4444-9cfd-324ae43f7334" />

<img width="1920" height="1080" alt="Screenshot 469" src="https://github.com/user-attachments/assets/19462121-215d-491b-8b9b-dc7eaf0219e7" />

<img width="1920" height="1080" alt="Screenshot 470" src="https://github.com/user-attachments/assets/b0927fa3-5423-4cd7-a7b6-d045be532677" />

<img width="1920" height="1080" alt="Screenshot 471" src="https://github.com/user-attachments/assets/5e8e3981-cf20-4d48-ac6e-d77ca55793f9" />

<img width="1920" height="1080" alt="Screenshot 472" src="https://github.com/user-attachments/assets/9f1e7d99-00e4-4cae-8142-e7ac99e334ed" />

<img width="1920" height="1080" alt="Screenshot 473" src="https://github.com/user-attachments/assets/2cd6b5c8-3889-4fb5-a0e0-f8cb5b29e8ac" />

<img width="1920" height="1080" alt="Screenshot 474" src="https://github.com/user-attachments/assets/ea3212d3-b39d-4f21-8efb-ba6be072d1d8" />

<img width="1920" height="1080" alt="Screenshot 475" src="https://github.com/user-attachments/assets/a12e7d4e-bd3e-4989-b514-615d2d29ec9c" />

<img width="1920" height="1080" alt="Screenshot 476" src="https://github.com/user-attachments/assets/73fdd378-9de6-4077-aed6-306b362825f2" />

<img width="1920" height="1080" alt="Screenshot 477" src="https://github.com/user-attachments/assets/02f29f0a-90f6-4b1d-a973-1f8c983487ae" />

<img width="1920" height="1080" alt="Screenshot 478" src="https://github.com/user-attachments/assets/34d1693c-ab24-45a7-9f0b-5038073e06d0" />
