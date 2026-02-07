'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Activity, MessageSquare, Search, LogOut, Menu, X, Shield, User, Clock } from 'lucide-react';

export default function AdminQueriesPage() {
  const router = useRouter();
  const [queries, setQueries] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [mobileMenu, setMobileMenu] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u || u.role !== 'admin') { router.push('/login'); return; }
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const res = await fetch('/api/chatbot/queries', { headers });
      const data = await res.json();
      setQueries(data.queries || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); };

  let filtered = queries.filter(q =>
    q.query?.toLowerCase().includes(search.toLowerCase()) ||
    q.response?.toLowerCase().includes(search.toLowerCase()) ||
    q.users?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === 'oldest') filtered = [...filtered].reverse();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>;

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
            <button onClick={() => router.push('/admin/dashboard')} className="text-gray-600 hover:text-gray-900 text-sm">Dashboard</button>
            <button onClick={() => router.push('/admin/users')} className="text-gray-600 hover:text-gray-900 text-sm">Users</button>
            <button onClick={() => router.push('/admin/queries')} className="text-indigo-600 font-medium text-sm">Queries</button>
          </nav>
          <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4" /></Button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
            <button onClick={() => { router.push('/admin/dashboard'); setMobileMenu(false); }} className="block w-full text-left py-2 text-gray-600">Dashboard</button>
            <button onClick={() => { router.push('/admin/users'); setMobileMenu(false); }} className="block w-full text-left py-2 text-gray-600">Users</button>
            <button onClick={() => { router.push('/admin/queries'); setMobileMenu(false); }} className="block w-full text-left py-2 text-indigo-600 font-medium">Queries</button>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Chatbot Queries</h1>
            <p className="text-gray-500">{queries.length} total queries</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search queries..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}>
              <Clock className="w-4 h-4 mr-1" />{sortBy === 'newest' ? 'Newest' : 'Oldest'}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((q) => (
            <Card key={q.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{q.users?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{new Date(q.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="text-xs text-indigo-600 font-medium mb-1">Question</p>
                    <p className="text-sm text-gray-700">{q.query}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium mb-1">AI Response</p>
                    <p className="text-sm text-gray-600">{q.response}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No queries found</p>
          </div>
        )}
      </main>
    </div>
  );
}
