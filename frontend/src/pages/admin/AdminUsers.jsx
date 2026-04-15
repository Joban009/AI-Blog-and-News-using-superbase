import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Shield, UserX, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const roleBadge = r => ({ admin:'badge-amber', user:'badge-green' }[r]||'badge-gray');

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore(s => s.user);

  async function load() {
    setLoading(true);
    const { data } = await adminApi.listUsers();
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(u) {
    if (u.id === currentUser.id) { toast.error("Can't deactivate yourself"); return; }
    await adminApi.updateUser(u.id, { is_active: !u.is_active });
    toast.success(`User ${u.is_active ? 'deactivated' : 'activated'}`);
    load();
  }

  async function toggleAdmin(u) {
    if (u.id === currentUser.id) { toast.error("Can't change your own role"); return; }
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${u.username}'s role to ${newRole}?`)) return;
    await adminApi.updateUser(u.id, { role: newRole });
    toast.success(`Role updated to ${newRole}`);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink-900">Users</h1>
        <p className="font-sans text-sm text-ink-500 mt-0.5">{users.length} registered users</p>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-ink-400 font-sans text-sm">Loading…</div>
        ) : (
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-ink-100 text-xs text-ink-400 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-ink-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-serif font-bold text-xs shrink-0">
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-ink-900">{u.username}</p>
                        <p className="text-xs text-ink-400">{u.id === currentUser.id ? '(you)' : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`badge ${roleBadge(u.role)}`}>{u.role}</span></td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-400 text-xs whitespace-nowrap">
                    {format(new Date(u.created_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => toggleAdmin(u)} disabled={u.id===currentUser.id}
                        title={u.role==='admin'?'Remove admin':'Make admin'}
                        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-30">
                        <Shield size={15}/>
                      </button>
                      <button onClick={() => toggleActive(u)} disabled={u.id===currentUser.id}
                        title={u.is_active?'Deactivate':'Activate'}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${u.is_active?'text-red-400 hover:bg-red-50':'text-green-600 hover:bg-green-50'}`}>
                        {u.is_active ? <UserX size={15}/> : <UserCheck size={15}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
