'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Copy, CheckCircle, AlertCircle, Database, Loader2 } from 'lucide-react';

const SETUP_SQL = `-- DataPulse Database Setup
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration VARCHAR(50),
  level VARCHAR(50) DEFAULT 'Beginner',
  enrollments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS chatbot_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_user_id ON chatbot_queries(user_id);

-- Disable RLS for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_queries DISABLE ROW LEVEL SECURITY;

-- Enable real-time for activities and chatbot_queries
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE chatbot_queries;`;

export default function SetupPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [status, setStatus] = useState(null);

  const copySQL = () => {
    navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const checkSetup = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/setup/check');
      const data = await res.json();
      if (data.setup) {
        setStatus({ ok: true, msg: 'Tables found! ' + (data.hasData ? 'Data exists.' : 'Ready to seed.'), hasData: data.hasData });
      } else {
        setStatus({ ok: false, msg: 'Tables not found. Please run the SQL above in Supabase SQL Editor.' });
      }
    } catch (e) {
      setStatus({ ok: false, msg: 'Connection error: ' + e.message });
    }
    setChecking(false);
  };

  const seedData = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/setup/seed', { method: 'POST' });
      const data = await res.json();
      if (data.seeded || data.message?.includes('successfully')) {
        setStatus({ ok: true, msg: 'Seed data created! Redirecting to login...', hasData: true });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setStatus({ ok: false, msg: data.error || 'Seeding failed' });
      }
    } catch (e) {
      setStatus({ ok: false, msg: e.message });
    }
    setSeeding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">DataPulse Setup</span>
        </div>

        <Card className="border-0 shadow-2xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Step 1: Create Database Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Copy the SQL below and run it in your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline">Supabase SQL Editor</a>.
            </p>
            <div className="relative">
              <Button onClick={copySQL} size="sm" variant="outline" className="absolute top-3 right-3 z-10">
                {copied ? <><CheckCircle className="w-4 h-4 mr-1 text-green-500" /> Copied!</> : <><Copy className="w-4 h-4 mr-1" /> Copy SQL</>}
              </Button>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-80 text-sm leading-relaxed">
                {SETUP_SQL}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-indigo-500" />
              Step 2: Verify & Seed Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Button onClick={checkSetup} disabled={checking} className="bg-indigo-500 hover:bg-indigo-600">
                {checking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</> : 'Verify Tables'}
              </Button>
              {status?.ok && !status.hasData && (
                <Button onClick={seedData} disabled={seeding} variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                  {seeding ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Seeding...</> : 'Seed Sample Data'}
                </Button>
              )}
              {status?.ok && status.hasData && (
                <Button onClick={() => router.push('/login')} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Go to Login
                </Button>
              )}
            </div>
            {status && (
              <div className={`flex items-start gap-2 p-3 rounded-lg ${status.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {status.ok ? <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                <span className="text-sm">{status.msg}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
