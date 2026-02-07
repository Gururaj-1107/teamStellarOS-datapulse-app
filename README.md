---
Our Deployed website link(Vercel)    https://team-stellar-os-datapulse-app.vercel.app/
DataPulse – AI-Powered Learning Analytics Platform (Team StellarOS)
DataPulse is a real-time analytics and monitoring platform designed for EdTech environments. It tracks user activity, analyzes learning behavior, and provides AI-driven insights to improve engagement and course effectiveness.
This system integrates real-time databases, analytics dashboards, and an AI chatbot to deliver actionable insights.
---

Features
• Real-time user activity tracking
• Interactive analytics dashboard
• Course enrollment and progress monitoring
• AI-powered chatbot assistant
• Admin analytics panel
• Secure authentication system
• Supabase real-time database integration

---

Tech Stack
Frontend
• Next.js
• Tailwind CSS
• React
Backend
• Next.js API Routes
• Supabase (PostgreSQL + Realtime)
• Python
AI Integration
• OpenAI API (for chatbot insights)
Deployment
• Localhost / Cloud deployment ready
• GitHub repository based development

---

Project Structure
teamStellarOS-datapulse-app-main/
│
├── app/
│ ├── admin/
│ ├── api/
│ ├── courses/
│ ├── dashboard/
│ ├── login/
│ ├── signup/
│ ├── profile/
│ ├── layout.js
│ ├── page.js
│ └── globals.css
│
├── components/
├── hooks/
├── lib/
├── memory/
├── tests/
├── test_reports/
│
├── .env
├── .env.local
├── .gitignore
├── package.json
└── README.md
components/ # Reusable UI components
lib/ # Database and helper utilities
hooks/ # Custom React hooks

---

Database:
Add:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
OPENAI_API_KEY=your_key
You can obtain these keys from:
Supabase → Settings → API

---

7. API Endpoints
   Create Next.js API routes:
   /api/activities
   POST: Log activity
   GET: Fetch activities
   /api/chatbot
   POST: Accept query and return placeholder response
   Save query to database
   Include:
   // TODO: Replace with OpenAI API call
   const aiResponse = "Placeholder response"
   /api/analytics
   Return aggregated metrics for charts
   /api/users
   GET all users (admin only)
   GET user by ID with activities
   /api/courses
   GET all courses
   POST enroll user

Database
Supabase is used as the primary database.
Tables used:
• users
• courses
• enrollments
• activities
• chatbot_queries
Realtime is enabled to track live user actions.

---

AI Chatbot
The chatbot:
• Answers course-related questions
• Logs queries in the database
• Uses OpenAI API for generating responses

---

Admin Panel
Admin features include:
• Viewing user analytics
• Tracking activities
• Monitoring course engagement

---

Architecture Overview
The system follows a 3-layer architecture:
Client (Next.js UI) → API Layer (Next.js backend routes) → Supabase Database + OpenAI API

---

Future Improvements
• Fraud detection module
• Behavioral analytics engine
• Advanced AI recommendations
• Predictive learning insights

---
