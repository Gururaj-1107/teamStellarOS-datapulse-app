# DataPulse - Universal Website Data Tracking & Intelligence Platform

## Overview
DataPulse is a professional SaaS-style EdTech learning platform with AI-powered insights and real-time activity tracking. It features two role-based interfaces: User (student) and Admin.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL with real-time subscriptions)
- **Auth:** Custom JWT with bcryptjs
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React

## Demo Accounts
- **Admin:** admin@datapulse.com / password123
- **User 1:** sarah@example.com / password123
- **User 2:** john@example.com / password123

## Pages
### Public
- `/` - Landing page
- `/login` - Login
- `/signup` - Signup
- `/setup` - Database setup

### User (role: user)
- `/dashboard` - User dashboard with courses, stats, chatbot
- `/courses` - Course catalog with search and enroll
- `/courses/[id]` - Course detail with video, notes, chatbot
- `/profile` - User profile with activity history

### Admin (role: admin)
- `/admin/dashboard` - Analytics with charts, live feed, AI insights
- `/admin/users` - User management with search, CSV export
- `/admin/queries` - Chatbot queries review

## API Endpoints
- POST `/api/auth/login` - Login
- POST `/api/auth/signup` - Signup
- GET `/api/auth/me` - Current user
- GET `/api/courses` - List courses
- GET `/api/courses/:id` - Course details
- POST `/api/courses/enroll` - Enroll in course
- POST `/api/activities` - Log activity
- GET `/api/activities` - Get activities
- POST `/api/chatbot` - Chat query
- GET `/api/chatbot/queries` - All queries (admin)
- GET `/api/analytics` - Analytics data (admin)
- GET `/api/users` - List users (admin)
- GET `/api/users/:id` - User details (admin)
- GET `/api/dashboard` - Dashboard data
