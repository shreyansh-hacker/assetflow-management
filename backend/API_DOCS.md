# AssetFlow API Documentation

Base URL: `http://localhost:3000/api/v1`

## Authentication

### `POST /auth/signup`
- **Body**: `{ "name": "John", "email": "john@test.com", "password": "password123", "roleName": "Employee", "departmentId": 1 }`
- **Response**: `{ "success": true, "message": "Signup successful", "data": { "user": {}, "token": "..." } }`

### `POST /auth/login`
- **Body**: `{ "email": "john@test.com", "password": "password123" }`
- **Response**: `{ "success": true, "message": "Login successful", "data": { "user": {}, "token": "..." } }`

### `GET /auth/profile`
- **Header**: `Authorization: Bearer <token>`
- **Response**: Profile data.

## Departments
- `GET /departments` - List departments
- `POST /departments` - Create department `{ "name": "HR" }`
- `PUT /departments/:id` - Update
- `DELETE /departments/:id` - Delete

## Assets
- `GET /assets` - List assets (Query: ?status=Available&search=Macbook)
- `POST /assets` - Create asset
- `PUT /assets/:id` - Update asset
- `DELETE /assets/:id` - Delete asset

## Allocation
- `POST /allocation` - Allocate asset to user `{ "assetId": 1, "userId": 2 }`
- `POST /allocation/return` - Return asset `{ "allocationId": 1 }`

*(Additional endpoints described similarly for Transfer, Booking, Maintenance, Audit, Dashboard, Reports)*
