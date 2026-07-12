# Changelog - AssetFlow Enterprise

All notable changes to this project during this integration phase are documented here.

---

## [1.2.0] - 2026-07-12

### Added
- **Authentication Context**: Created `AuthContext.tsx` to handle user state, signups, logins, JWT extraction, and role checks (`isAdmin`, `isAssetManager`, `isEmployee`).
- **Route Guard**: Created `ProtectedRoute.tsx` to prevent unauthenticated users from accessing protected workspace pages.
- **Custom Notifications REST Endpoints**: Implemented `/notifications`, `/notifications/:id/read`, and `/notifications/read-all` controllers, routes, and services on the backend server.

### Changed
- **Axios HTTP Client**: Integrated central config in `src/services/api.ts` which attaches JWT Bearer tokens to all requests and redirects users to `/login` upon `401 Unauthorized` token expiration.
- **Premium Login UI**: Redesigned `Login.tsx` into a high-end, responsive dark-mode portal featuring interactive tabs for Login, Registration (Signup with role/department options), and Password Recovery.
- **Connected Services**: Migrated all offline mock services to connect directly with the local WSL2 Express/Prisma API:
  - `organization.ts` -> Connects to departments, employees, categories.
  - `assets.ts` -> Connects to full asset listing, creation, and updates.
  - `allocations.ts` -> Triggers transfers, allocations, and custody history logs.
  - `bookings.ts` -> Connects meeting rooms and resource booking slots.
  - `maintenance.ts` -> Integrates Kanban status triggers and comment logs.
  - `audits.ts` -> Integrates audit cycles and barcode scan verifications.
  - `reports.ts` -> Aggregates status charts with financial cost indicators.
  - `notifications.ts` -> Feeds live notification badges into the Navbar and sidebar.
- **Layout Integration**: Bound Sidebar footer details and Navbar initials/red alerts to live user profile stats from `AuthContext` and React Query.

### Fixed
- **WSL Database Access**: Adjusted WSL PostgreSQL config to listen on `0.0.0.0` and allow password scram-sha-256 validation from Windows hosts.
- **Localhost Resolution Issue**: Fixed Node localhost IPv6 resolution loop by enforcing direct `127.0.0.1` binding.
- **Build Warnings**: Cleared all TypeScript unused variables and corrected unnamed LoadingSkeleton default export bindings. Zero compiler errors.
