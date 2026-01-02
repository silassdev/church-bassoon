# Church Management and Payment Platform

A robust management system for churches featuring hierarchical user roles, secure authentication, and role-specific dashboard experiences.

## Core Features

### Three-Tier User System
- Admin: Full system control, transaction oversight, and user approval management.
- Coordinator: Support ticket management, member directory access, and event coordination.
- Member: Personal giving history, pledge management, and support requests.

### Authentication and Security
- Role-based Access Control (RBAC): Dynamic sidebars and fragments based on user level.
- Multi-step Registration: Email verification for all users and mandatory admin approval for coordinators.
- Security Measures: Integrated reCAPTCHA v3, honeypot fields, rate limiting (Redis/In-memory), and secure password hashing.
- Unified Auth: Support for both traditional credentials and Google OAuth.

## Tech Stack
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Database: MongoDB via Mongoose
- Authentication: NextAuth.js
- Styling: Tailwind CSS
- Security: reCAPTCHA v3, ioredis
