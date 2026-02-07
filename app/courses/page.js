'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Activity, BookOpen, Clock, Users, Search, LogOut, Menu, X, CheckCircle } from 'lucide-react';

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetchData();
    logActivity('page_view', { page: 'courses', description: 'Browsed courses catalog' });
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, dashRes] = await Promise.all([
        fetch('/api/courses', { headers }),
        fetch('/api/dashboard', { headers })
      ]);
      const coursesData = await coursesRes.json();
      const dashData = await dashRes.json();
      setCourses(coursesData.courses || []);
      setEnrolledIds(new Set((dashData.enrollments || []).map(e => e.course_id)));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const logActivity = async (type, details) => {
    try { await fetch('/api/activities', { method: 'POST', headers, body: JSON.stringify({ action_type: type, details, metadata: { source: 'web' } }) }); } catch (e) {}
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      const res = await fetch('/api/courses/enroll', { method: 'POST', headers, body: JSON.stringify({ course_id: courseId }) });
      if (res.ok) {
        setEnrolledIds(s => new Set([...s, courseId]));
      }
    } catch (e) { console.error(e); }
    setEnrolling(null);
  };

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); };

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()));

  const levelColors = { Beginner: 'bg-emerald-50 text-emerald-700', Intermediate: 'bg-amber-50 text-amber-700', Advanced: 'bg-red-50 text-red-700' };

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
            <button onClick={() => router.push('/courses')} className="text-indigo-600 font-medium text-sm">Courses</button>
            <button onClick={() => router.push('/profile')} className="text-gray-600 hover:text-gray-900 text-sm">Profile</button>
          </nav>
          <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4" /></Button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
            <button onClick={() => { router.push('/dashboard'); setMobileMenu(false); }} className="block w-full text-left py-2 text-gray-600">Dashboard</button>
            <button onClick={() => { router.push('/courses'); setMobileMenu(false); }} className="block w-full text-left py-2 text-indigo-600 font-medium">Courses</button>
            <button onClick={() => { router.push('/profile'); setMobileMenu(false); }} className="block w-full text-left py-2 text-gray-600">Profile</button>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Course Catalog</h1>
            <p className="text-gray-500">{courses.length} courses available</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search courses..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <Card key={c.id} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`${levelColors[c.level] || 'bg-gray-50 text-gray-700'} border-0 text-xs`}>{c.level}</Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{c.enrollments_count}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{c.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{c.duration}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/courses/${c.id}`)}>
                    View Details
                  </Button>
                  {enrolledIds.has(c.id) ? (
                    <Button size="sm" className="flex-1 bg-emerald-500 hover:bg-emerald-600" disabled>
                      <CheckCircle className="w-4 h-4 mr-1" /> Enrolled
                    </Button>
                  ) : (
                    <Button size="sm" className="flex-1 bg-indigo-500 hover:bg-indigo-600" onClick={() => handleEnroll(c.id)} disabled={enrolling === c.id}>
                      {enrolling === c.id ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><BookOpen className="w-12 h-12 mx-auto mb-3" /><p>No courses found</p></div>}
      </main>
    </div>
  );
}
