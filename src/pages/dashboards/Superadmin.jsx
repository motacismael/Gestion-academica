import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Users, BookOpen, UserPlus, LogOut, Shield } from 'lucide-react';

export default function SuperadminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [materias, setMaterias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, materiasData] = await Promise.all([
          api.getUsers(),
          api.getMaterias()
        ]);
        setUsers(usersData);
        setMaterias(materiasData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const stats = {
    profesores: users.filter(u => u.roles?.nombre === 'profesor').length,
    estudiantes: users.filter(u => u.roles?.nombre === 'estudiante').length,
    materias: materias.length
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-slate-700">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Panel Control</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-medium">{user.nombre} {user.apellido}</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-slate-700 rounded-full text-slate-300">
                Superadmin
              </span>
            </div>
            <button onClick={logout} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<Users />} title="Profesores" value={stats.profesores} color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
          <StatCard icon={<Users />} title="Estudiantes" value={stats.estudiantes} color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
          <StatCard icon={<BookOpen />} title="Materias" value={stats.materias} color="bg-purple-500/10 text-purple-400 border-purple-500/20" />
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Usuarios Panel */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Gestión de Usuarios</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors">
                <UserPlus className="w-4 h-4" /> Nuevo
              </button>
            </div>
            <div className="space-y-3">
              {users.slice(0, 5).map(u => (
                <div key={u.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-xl hover:bg-slate-700/50 transition-colors cursor-pointer border border-slate-700/50">
                  <div>
                    <p className="font-medium text-white">{u.nombre} {u.apellido}</p>
                    <p className="text-xs text-slate-400">{u.email || u.matricula}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    {u.roles?.nombre}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Materias Panel */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Materias Activas</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors">
                Ver Todas
              </button>
            </div>
            <div className="space-y-3">
              {materias.slice(0, 5).map(m => (
                <div key={m.id} className="p-3 bg-slate-800 rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                  <p className="font-medium text-white">{m.nombre}</p>
                  <p className="text-xs text-slate-400 line-clamp-1">{m.descripcion || 'Sin descripción'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-md transition-transform hover:scale-[1.02] ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <h3 className="text-4xl font-bold">{value}</h3>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          {icon}
        </div>
      </div>
    </div>
  );
}
