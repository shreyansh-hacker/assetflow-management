AssetFlow Backend

<div align="center">

## Enterprise Asset & Resource Management System

### Odoo Hackathon 2026

A production-ready backend built using **Node.js**, **Express.js**, **Prisma ORM**, and **PostgreSQL/SQLite**, providing secure REST APIs for enterprise asset management with authentication, role-based access control, validation, notifications, activity logs, and complete asset lifecycle management.

</div>

---

#  Table of Contents

- Introduction
- Project Overview
- Problem Statement
- Solution
- Objectives
- Key Features
- Technology Stack
- System Architecture
- Project Structure
- Authentication & Authorization
- User Roles
- Core Modules
- Database Design
- Asset Lifecycle
- Business Rules
- REST APIs
- Installation
- Environment Variables
- Prisma Setup
- Running the Project
- Security
- Logging
- Notifications
- API Response Format
- Future Enhancements
- Contributors

---

# 📌 Introduction

AssetFlow is an **Enterprise Asset & Resource Management System** developed for the **Odoo Hackathon 2026**.

The backend provides a centralized platform to efficiently manage organizational assets throughout their lifecycle. It supports authentication, authorization, asset allocation, bookings, maintenance requests, audits, reporting, notifications, and activity logging.

The system follows a **clean layered architecture**, ensuring scalability, maintainability, and production readiness.

---

#  Project Overview

Organizations often manage assets using spreadsheets or disconnected systems, making it difficult to track ownership, availability, maintenance, and utilization.

AssetFlow addresses these issues by providing a centralized backend that manages:

- Employees
- Departments
- Assets
- Categories
- Bookings
- Maintenance
- Transfers
- Audits
- Reports
- Notifications

All operations are performed through secure REST APIs.

---

#  Problem Statement

Large organizations face several challenges while managing enterprise assets.

Some common issues include:

- Asset duplication
- Double allocation
- Booking conflicts
- Missing maintenance records
- Poor asset visibility
- Manual approval workflows
- Lack of accountability
- Difficult reporting
- No centralized tracking
- Human errors

Traditional spreadsheet-based management cannot efficiently handle thousands of assets across multiple departments.

---

#  Proposed Solution

AssetFlow provides a centralized backend system capable of managing the complete asset lifecycle.

The solution includes:

- Secure Authentication
- Role Based Access Control
- Asset Allocation
- Asset Booking
- Maintenance Workflow
- Audit Management
- Reports
- Dashboard KPIs
- Notifications
- Activity Logs

Every operation follows predefined business rules to maintain data integrity.

---

#  Objectives

The primary objectives of the backend are:

- Centralize asset management.
- Improve asset visibility.
- Prevent duplicate allocations.
- Maintain complete audit trails.
- Support secure authentication.
- Enable department-wise management.
- Generate reports automatically.
- Provide scalable REST APIs.
- Support frontend integration.
- Follow production-grade architecture.

---

#  Key Features

## Authentication

- User Signup
- User Login
- JWT Authentication
- Password Hashing using bcrypt
- Protected APIs

---

## Authorization

Role Based Access Control (RBAC)

Supported Roles:

- Admin
- Asset Manager
- Department Head
- Employee

---

## Organization Management

- Departments
- Categories
- Employees

---

## Asset Management

- Create Asset
- Update Asset
- Delete Asset
- Search Assets
- Pagination
- Filters
- Department Filter
- Status Filter

---

## Asset Allocation

- Allocate Assets
- Return Assets
- Transfer Assets
- Approve Transfers
- Reject Transfers

---

## Booking Management

- Book Assets
- Update Bookings
- Delete Bookings
- Prevent Overlapping Bookings

---

## Maintenance Management

- Create Maintenance Requests
- Approve Requests
- Reject Requests
- Resolve Maintenance

---

## Audit Management

- Create Audit Cycle
- Verify Assets
- Close Audit
- Mark Assets Lost

---

## Dashboard

Real-time KPIs

- Available Assets
- Allocated Assets
- Active Bookings
- Pending Transfers
- Upcoming Returns
- Maintenance Requests

---

## Reports

- Asset Report
- Utilization Report
- Maintenance Report

---

## Notifications

Automatic notifications are generated for:

- Asset Assigned
- Booking Created
- Transfer Approved
- Maintenance Approved
- Audit Closed
- Overdue Returns

---

## Activity Logs

Every important system action is recorded.

Each log stores:

- User
- Action
- Entity
- Entity ID
- Timestamp

---

# 🛠 Technology Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Backend Framework |
| Prisma ORM | Database ORM |
| PostgreSQL | Production Database |
| SQLite | Development Database |
| JWT | Authentication |
| bcrypt | Password Encryption |
| Express Validator | Validation |
| Helmet | Security |
| CORS | Cross-Origin Requests |

---

#  System Architecture

```

                Client
                   │
                   ▼
          Express Routes
                   │
                   ▼
            Controllers
                   │
                   ▼
              Services
        (Business Logic Layer)
                   │
                   ▼
             Prisma ORM
                   │
                   ▼
        PostgreSQL / SQLite

```

The architecture follows separation of concerns.

### Routes

Receive incoming API requests.

### Controllers

Handle request-response lifecycle.

### Services

Contain all business logic.

### Prisma ORM

Handles database communication.

### Database

Stores persistent enterprise data.

---

#  Project Structure

backend/
│
├── prisma/
│ ├── migrations/
│ ├── schema.prisma
│ └── seed.js
│
├── src/
│ ├── config/
│ ├── controllers/
│ ├── middleware/
│ ├── routes/
│ ├── services/
│ ├── validators/
│ ├── utils/
│ ├── database/
│ ├── app.js
│ └── server.js
│
├── postman/
├── API_DOCS.md
├── package.json
└── README.md

---

#  Authentication

Authentication is implemented using JSON Web Tokens (JWT).

Authentication Flow

User Login

↓

Email & Password Verification

↓

JWT Token Generated

↓

Token Returned to Client

↓

Protected API Access

Passwords are encrypted using bcrypt before storing them in the database.

---

#  User Roles

###  Admin

- Complete system access
- Manage users
- Manage departments
- Manage assets
- Generate reports

---

###  Asset Manager

- Create assets
- Allocate assets
- Approve maintenance
- Manage transfers

---

###  Department Head

- View department assets
- Approve requests
- Monitor reports

---

###  Employee

- Book assets
- View allocations
- Submit maintenance requests

---

#  Database Design

The backend follows a normalized relational database design.

Main Tables

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

All relationships use foreign keys to maintain data integrity.

# ⚙️ Business Rules

The backend enforces all critical business rules to maintain data integrity and prevent invalid operations. These validations are implemented at the service layer rather than relying on the frontend.

### Asset Allocation Rules

- An asset can only be allocated if its status is **Available**.
- An asset cannot be allocated to multiple employees simultaneously.
- Returned assets are automatically marked as **Available**.
- Lost, Retired, or Disposed assets cannot be allocated.

---

### Booking Rules

- Booking start date must be before the end date.
- Overlapping bookings for the same asset are not allowed.
- Assets under maintenance cannot be booked.
- Reserved assets cannot be allocated during the booking period.

---

### Maintenance Rules

- Only authorized users can approve maintenance requests.
- Assets under maintenance cannot be allocated or booked.
- Once maintenance is resolved, the asset status changes back to **Available**.

---

### Transfer Rules

- Asset transfers require approval.
- Rejected transfers do not change asset ownership.
- Approved transfers automatically update allocation records.

---

### Audit Rules

- Audit cycles can only be closed after verification.
- Missing assets can be marked as **Lost**.
- Audit logs are permanently stored.

---

### Validation Rules

The backend validates:

- Required fields
- Duplicate asset codes
- Duplicate serial numbers
- Invalid departments
- Invalid employees
- Invalid categories
- Invalid booking dates
- Invalid asset status transitions

---

# 🔄 Asset Lifecycle

Every asset follows a controlled lifecycle.

```
Available
      │
      ▼
Allocated
      │
      ▼
Returned
      │
      ▼
Available
```

Maintenance Flow

```
Available
      │
      ▼
Maintenance Requested
      │
      ▼
Approved
      │
      ▼
Under Maintenance
      │
      ▼
Resolved
      │
      ▼
Available
```

Transfer Flow

```
Allocated
      │
      ▼
Transfer Requested
      │
      ▼
Approved
      │
      ▼
Transferred
```

Audit Flow

```
Audit Created
      │
      ▼
Verification
      │
      ▼
Audit Closed
```

---

# 📡 REST API Modules

The backend exposes REST APIs for all major modules.

---

## 🔐 Authentication

| Method | Endpoint |
|---------|----------|
| POST | /auth/signup |
| POST | /auth/login |
| GET | /auth/profile |

---

## 🏢 Departments

| Method | Endpoint |
|---------|----------|
| GET | /departments |
| POST | /departments |
| PUT | /departments/:id |
| DELETE | /departments/:id |

---

## 📂 Categories

| Method | Endpoint |
|---------|----------|
| GET | /categories |
| POST | /categories |

---

## 👨‍💼 Employees

| Method | Endpoint |
|---------|----------|
| GET | /employees |
| POST | /employees |
| PUT | /employees/:id |

---

## 💻 Assets

| Method | Endpoint |
|---------|----------|
| GET | /assets |
| GET | /assets/:id |
| POST | /assets |
| PUT | /assets/:id |
| DELETE | /assets/:id |

Supports:

- Search
- Pagination
- Status Filter
- Department Filter

---

## 📦 Allocation

| Method | Endpoint |
|---------|----------|
| POST | /allocation |
| POST | /allocation/return |
| POST | /transfer |
| PUT | /transfer/:id/approve |
| PUT | /transfer/:id/reject |

---

## 📅 Booking

| Method | Endpoint |
|---------|----------|
| GET | /bookings |
| POST | /bookings |
| PUT | /bookings/:id |
| DELETE | /bookings/:id |

---

## 🔧 Maintenance

| Method | Endpoint |
|---------|----------|
| GET | /maintenance |
| POST | /maintenance |
| PUT | /maintenance/:id/approve |
| PUT | /maintenance/:id/reject |
| PUT | /maintenance/:id/resolve |

---

## 📋 Audit

| Method | Endpoint |
|---------|----------|
| GET | /audits |
| POST | /audits |
| POST | /audits/:id/verify |
| POST | /audits/:id/close |

---

## 📊 Dashboard

| Method | Endpoint |
|---------|----------|
| GET | /dashboard |

Returns:

- Total Assets
- Available Assets
- Allocated Assets
- Active Bookings
- Pending Transfers
- Upcoming Returns
- Maintenance Requests

---

## 📈 Reports

| Method | Endpoint |
|---------|----------|
| GET | /reports/assets |
| GET | /reports/utilization |
| GET | /reports/maintenance |

---

# 🚀 Installation Guide

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file in the project root.

For SQLite (Development):

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3000
```

For PostgreSQL (Production):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/assetflow?schema=public"
JWT_SECRET="your-secret-key"
PORT=3000
```

---

# 🗄 Prisma Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev --name init
```

Seed the database:

```bash
node prisma/seed.js
```

---

# ▶️ Running the Project

Start the development server:

```bash
npm run dev
```

For production:

```bash
npm start
```

The backend server will be available at:

```
http://localhost:3000
```

---

# 🛡️ Security Features

The backend includes several enterprise-grade security mechanisms:

- JWT Authentication
- Password Hashing using bcrypt
- Role-Based Access Control (RBAC)
- Input Validation
- Secure HTTP Headers (Helmet)
- CORS Configuration
- Rate Limiting
- Error Handling Middleware

---

# 📝 Activity Logging

Every important action performed by a user is stored in the Activity Logs table.

Examples include:

- User Login
- Asset Created
- Asset Updated
- Asset Allocated
- Asset Returned
- Maintenance Approved
- Transfer Approved
- Audit Closed

Each log records:

- User ID
- Action
- Entity
- Entity ID
- Timestamp

---

# 🔔 Notification System

Automatic notifications are generated for:

- Asset Assigned
- Booking Created
- Transfer Approved
- Maintenance Approved
- Audit Closed
- Overdue Asset Return

These notifications help users stay informed about important events.

---

# 📦 Standard API Response

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Asset already allocated"
}
```

---

# 🌱 Seed Data

The project includes a seed script that populates the database with sample data.

The seed script creates:

- Default Roles
- Admin User
- Departments
- Categories
- Employees
- Assets

Run:

```bash
node prisma/seed.js
```

---

# 📚 API Documentation

Detailed API documentation is available in:

- `API_DOCS.md`

API testing can be performed using the included **Postman Collection**.

---

# 🔮 Future Enhancements

Some planned improvements include:

- Docker Support
- PostgreSQL Production Deployment
- Refresh Token Authentication
- Email Notifications
- WebSocket Notifications
- CI/CD Pipeline
- Unit Testing
- Integration Testing
- Cloud Deployment (AWS/Azure/GCP)

---

# 👨‍💻 Developed For

**Odoo Hackathon 2026**

### Project

**AssetFlow – Enterprise Asset & Resource Management System**

---

# 🙌 Acknowledgements

This project was developed as part of the **Odoo Hackathon 2026**, focusing on building a scalable, secure, and production-ready Enterprise Asset & Resource Management System. The backend is designed to integrate seamlessly with a modern frontend while following industry best practices for architecture, security, and maintainability.

---

# 📄 License

This project is intended for educational, demonstration, and hackathon purposes.

© 2026 AssetFlow Team. All Rights Reserved.
