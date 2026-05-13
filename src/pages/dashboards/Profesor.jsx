import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Users, BookOpen, LogOut, CheckCircle } from 'lucide-react';

export default function ProfesorDashboard() {
  const { user, logout } = useAuth();
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materiasData, usuariosData] = await Promise.all([
          api.getMaterias(),
          api.getUsers()
        ]);
        // Materias automatically filtered by RLS or we filter here if needed. 
        // With RLS, it returns only what they own.
        setMaterias(materiasData);
        setEstudiantes(usuariosData.filter(u => u.roles?.nombre === 'estudiante'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-indigo-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-indigo-950">Panel Docente</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-600">{user.nombre} {user.apellido}</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-100 rounded-full text-indigo-700">
                Profesor
              </span>
            </div>
            <button onClick={logout} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-indigo-600">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-indigo-50 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600"><BookOpen className="w-8 h-8"/></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Mis Materias</p>
              <h3 className="text-3xl font-bold text-indigo-950">{materias.length}</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-indigo-50 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-blue-50 rounded-xl text-blue-600"><Users className="w-8 h-8"/></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Estudiantes Globales</p>
              <h3 className="text-3xl font-bold text-indigo-950">{estudiantes.length}</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-indigo-50 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-indigo-50 flex justify-between items-center bg-indigo-50/30">
            <h2 className="text-lg font-bold text-indigo-950">Gestión de Materias</h2>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
              + Nueva Materia
            </button>
          </div>
          <div className="divide-y divide-indigo-50">
            {materias.map(m => (
              <div key={m.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                <div>
                  <h4 className="font-semibold text-slate-800">{m.nombre}</h4>
                  <p className="text-sm text-slate-500">{m.descripcion || 'Sin descripción'}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded text-sm font-medium transition-opacity">
                  Gestionar Calificaciones
                </button>
              </div>
            ))}
            {materias.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No tienes materias asignadas aún.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
