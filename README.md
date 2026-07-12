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



## DASHBOARD 
![alt text](public/WhatsApp%20Image%202026-07-12%20at%205.04.49%20PM.jpeg)

![alt text](public/WhatsApp%20Image%202026-07-12%20at%205.05.21%20PM.jpeg)

![alt text](public/WhatsApp%20Image%202026-07-12%20at%205.05.37%20PM.jpeg)

![alt text](public/Screenshot%20(464).png)
![alt text](public/Screenshot%20(465).png)
![alt text](public/Screenshot%20(466).png)
![alt text](public/Screenshot%20(467).png)
![alt text](public/Screenshot%20(468).png)
![alt text](public/Screenshot%20(469).png)
![alt text](public/Screenshot%20(470).png)
![alt text](public/Screenshot%20(471).png)
![alt text](public/Screenshot%20(472).png)
![alt text](public/Screenshot%20(473).png)
![alt text](public/Screenshot%20(474).png)
![alt text](public/Screenshot%20(475).png)
![alt text](public/Screenshot%20(476).png)
![alt text](public/Screenshot%20(477).png)
![alt text](public/Screenshot%20(478).png)





