'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Shield, Zap, Users, BookOpen, Bot, ArrowRight, Activity } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track every user interaction instantly with live dashboards and intelligent data visualization.' },
    { icon: Shield, title: 'Role-Based Access', desc: 'Secure admin and user interfaces with granular permission controls and activity monitoring.' },
    { icon: Bot, title: 'AI Chatbot', desc: 'Intelligent course assistant powered by AI to help students with questions and guidance.' },
    { icon: Activity, title: 'Activity Tracking', desc: 'Every browse, enrollment, download, and query automatically logged and analyzed.' },
    { icon: BookOpen, title: 'Course Management', desc: 'Comprehensive course catalog with enrollment tracking, progress monitoring, and materials.' },
    { icon: Zap, title: 'AI Insights', desc: 'Machine learning powered predictions for enrollment trends, peak usage, and user behavior.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DataPulse</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push('/login')} className="text-gray-600 hover:text-gray-900">Log In</Button>
            <Button onClick={() => router.push('/signup')} className="bg-indigo-500 hover:bg-indigo-600 text-white">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(244, 114, 182, 0.3) 0%, transparent 50%)' }} />
        <div className="relative container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-white/20">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/80 text-sm">Real-time tracking powered by AI</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Analytics that drive<br />
            <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">learning outcomes</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            DataPulse helps EdTech platforms turn user behavior into clear insights, with real-time tracking, AI-powered analytics, and intelligent course management.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" onClick={() => router.push('/signup')} className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105">
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')} className="border-white/30 text-black hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
              View Demo
            </Button>
          </div>
          <div className="mt-16 flex items-center justify-center gap-8 text-white/60">
            <div className="text-center"><div className="text-3xl font-bold text-white">10K+</div><div className="text-sm">Active Users</div></div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center"><div className="text-3xl font-bold text-white">500+</div><div className="text-sm">Courses</div></div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center"><div className="text-3xl font-bold text-white">99.9%</div><div className="text-sm">Uptime</div></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need for data intelligence</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Powerful tools to track, analyze, and optimize your EdTech platform performance.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Card key={i} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                    <f.icon className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to transform your platform?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">Join thousands of educators using DataPulse to understand and improve learning outcomes.</p>
          <Button size="lg" onClick={() => router.push('/signup')} className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl shadow-lg hover:scale-105 transition-all">
            Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">DataPulse</span>
            </div>
            <p className="text-sm">&copy; 2025 DataPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
