'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, User, Mail, Calendar, BookOpen, LogOut, Menu, X } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u) { router.push('/login'); return; }
    setUser(u);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard', { headers });
      const data = await res.json();
      setEnrollments(data.enrollments || []);
      setActivities(data.activities || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center"><Activity className="w-5 h-5 text-white" /></div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">DataPulse</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-900 text-sm">Dashboard</button>
            <button onClick={() => router.push('/courses')} className="text-gray-600 hover:text-gray-900 text-sm">Courses</button>
            <button onClick={() => router.push('/profile')} className="text-indigo-600 font-medium text-sm">Profile</button>
          </nav>
          <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4" /></Button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
            <button onClick={() => { router.push('/dashboard'); setMobileMenu(false); }} className="block w-full text-left py-2 text-gray-600">Dashboard</button>
            <button onClick={() => { router.push('/courses'); setMobileMenu(false); }} className="block w-full text-left py-2 text-gray-600">Courses</button>
            <button onClick={() => { router.push('/profile'); setMobileMenu(false); }} className="block w-full text-left py-2 text-indigo-600 font-medium">Profile</button>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-indigo-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500 flex items-center justify-center gap-1 mt-1"><Mail className="w-4 h-4" />{user?.email}</p>
                <Badge className="mt-3" variant="secondary">{user?.role}</Badge>
                <div className="border-t mt-6 pt-4 grid grid-cols-2 gap-4 text-center">
                  <div><p className="text-2xl font-bold text-gray-900">{enrollments.length}</p><p className="text-xs text-gray-500">Courses</p></div>
                  <div><p className="text-2xl font-bold text-gray-900">{activities.length}</p><p className="text-xs text-gray-500">Activities</p></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Enrolled Courses */}
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500" />Enrolled Courses</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {enrollments.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No enrolled courses</p>
                ) : enrollments.map((e, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer" onClick={() => router.push(`/courses/${e.course_id}`)}>
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{e.courses?.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={e.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-gray-500">{e.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activity History */}
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-500" />Activity History</CardTitle></CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No activity yet</p>
                ) : (
                  <div className="space-y-2">
                    {activities.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate">{a.details?.description || a.action_type}</p>
                          <p className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleString()}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{a.action_type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
