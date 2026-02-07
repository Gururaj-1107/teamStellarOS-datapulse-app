'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Users, Search, LogOut, Menu, X, Shield, Download, Calendar, Mail } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u || u.role !== 'admin') { router.push('/login'); return; }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { headers });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openUserDetail = async (userId) => {
    setSelectedUser(userId);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, { headers });
      const data = await res.json();
      setUserDetails(data);
    } catch (e) { console.error(e); }
    setDetailLoading(false);
  };

  const exportCSV = () => {
    const csv = ['Name,Email,Role,Joined,Activities'];
    filtered.forEach(u => {
      csv.push(`"${u.name}","${u.email}","${u.role}","${new Date(u.created_at).toLocaleDateString()}",${u.activity_count}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'datapulse_users.csv'; a.click();
  };

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); };
  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

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
            <button onClick={() => router.push('/admin/users')} className="text-indigo-600 font-medium text-sm">Users</button>
            <button onClick={() => router.push('/admin/queries')} className="text-gray-600 hover:text-gray-900 text-sm">Queries</button>
          </nav>
          <Button variant="ghost" size="sm" onClick={logout}><LogOut className="w-4 h-4" /></Button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
            <button onClick={() => { router.push('/admin/dashboard'); setMobileMenu(false); }} className="block w-full text-left py-2 text-gray-600">Dashboard</button>
            <button onClick={() => { router.push('/admin/users'); setMobileMenu(false); }} className="block w-full text-left py-2 text-indigo-600 font-medium">Users</button>
            <button onClick={() => { router.push('/admin/queries'); setMobileMenu(false); }} className="block w-full text-left py-2 text-gray-600">Queries</button>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500">{users.length} total users</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search users..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" />CSV</Button>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Activities</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openUserDetail(u.id)}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-gray-500">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className={u.role === 'admin' ? 'bg-indigo-500' : ''}>{u.role}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="outline">{u.activity_count}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm" className="text-indigo-500">View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filtered.length === 0 && <p className="text-center py-8 text-gray-400">No users found</p>}
          </CardContent>
        </Card>
      </main>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>
          ) : userDetails ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Users className="w-7 h-7 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{userDetails.user?.name}</h3>
                  <p className="text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{userDetails.user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={userDetails.user?.role === 'admin' ? 'default' : 'secondary'} className={userDetails.user?.role === 'admin' ? 'bg-indigo-500' : ''}>{userDetails.user?.role}</Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {new Date(userDetails.user?.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Activity Timeline</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(userDetails.activities || []).length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No activities</p>
                  ) : (userDetails.activities || []).map((a, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-50 border border-gray-100">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{a.details?.description || a.action_type}</p>
                        <p className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleString()}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{a.action_type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
