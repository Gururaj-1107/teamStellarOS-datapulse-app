'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, BookOpen, MessageSquare, TrendingUp, LogOut, Menu, X, Sparkles, ArrowUpRight, Shield, Eye } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#f472b6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [liveActivities, setLiveActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u || u.role !== 'admin') { router.push('/login'); return; }
    setUser(u);
    fetchAnalytics();
    fetchActivities();

    // Real-time subscription
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const channel = supabase
      .channel('admin-activities')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, (payload) => {
        setLiveActivities(prev => [payload.new, ...prev.slice(0, 19)]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics', { headers });
      const data = await res.json();
      setStats(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities?limit=20', { headers });
      const data = await res.json();
      setLiveActivities(data.activities || []);
    } catch (e) { console.error(e); }
  };

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); };

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers || 0, color: 'indigo', change: '+12%' },
    { icon: Eye, label: 'Active Today', value: stats.activeToday || 0, color: 'emerald', change: '+5%' },
    { icon: BookOpen, label: 'Total Courses', value: stats.totalCourses || 0, color: 'amber', change: '+3' },
    { icon: MessageSquare, label: 'Chatbot Queries', value: stats.totalQueries || 0, color: 'pink', change: '+18%' },
  ];

  const activityIcon = (type) => {
    switch(type) {
      case 'login': return '\uD83D\uDD11';
      case 'signup': return '\uD83C\uDF89';
      case 'course_enroll': return '\uD83D\uDCDA';
      case 'course_view': return '\uD83D\uDC41';
      case 'download': return '\uD83D\uDCE5';
      case 'chatbot_query': return '\uD83E\uDD16';
      case 'page_view': return '\uD83D\uDCC4';
      default: return '\u26A1';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">DataPulse Admin</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => router.push('/admin/dashboard')} className="text-indigo-600 font-medium text-sm">Dashboard</button>
            <button onClick={() => router.push('/admin/users')} className="text-gray-600 hover:text-gray-900 text-sm">Users</button>
            <button onClick={() => router.push('/admin/queries')} className="text-gray-600 hover:text-gray-900 text-sm">Queries</button>
          </nav>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200 hidden sm:flex">Admin</Badge>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
            <button onClick={() => { router.push('/admin/dashboard'); setMobileMenu(false); }} className="block w-full text-left py-2 text-indigo-600 font-medium">Dashboard</button>
            <button onClick={() => { router.push('/admin/users'); setMobileMenu(false); }} className="block w-full text-left py-2 text-gray-600">Users</button>
            <button onClick={() => { router.push('/admin/queries'); setMobileMenu(false); }} className="block w-full text-left py-2 text-gray-600">Queries</button>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Real-time platform analytics & insights</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${s.color}-50`}>
                    <s.icon className={`w-5 h-5 text-${s.color}-500`} />
                  </div>
                  <span className="text-xs text-emerald-600 font-medium flex items-center"><ArrowUpRight className="w-3 h-3" />{s.change}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Active Users */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-lg">Daily Active Users</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.dailyActiveUsers || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Course Enrollments */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-lg">Course Enrollments</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.courseEnrollments || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Activity Types Pie */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-lg">Activity Types</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={stats.activityTypes || []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {(stats.activityTypes || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Growth Area */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-lg">User Growth</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={stats.userGrowth || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v?.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="users" stroke="#6366f1" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar: Live Feed + AI Insights */}
          <div className="space-y-6">
            {/* Live Activity Feed */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Live Activity
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                <div className="space-y-3">
                  {liveActivities.length === 0 ? (
                    <p className="text-gray-400 text-center py-4 text-sm">No activities yet</p>
                  ) : liveActivities.map((a, i) => (
                    <div key={a.id || i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100 animate-fadeIn">
                      <span className="text-lg">{activityIcon(a.action_type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">
                          <span className="font-medium">{a.users?.name || 'User'}</span>
                          <span className="text-gray-400"> • {a.action_type?.replace('_', ' ')}</span>
                        </p>
                        <p className="text-xs text-gray-400 truncate">{a.details?.description || ''}</p>
                        <p className="text-xs text-gray-300 mt-0.5">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  AI Insights
                </CardTitle>
                {/* TODO: Replace with OpenAI API for real insights */}
              </CardHeader>
              <CardContent className="space-y-3">
                {(stats.insights || []).map((ins, i) => (
                  <div key={i} className="bg-white/80 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">{ins.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{ins.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
