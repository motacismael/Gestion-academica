import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { GraduationCap, LogOut, KeyRound, BookOpen } from 'lucide-react';

export default function EstudianteDashboard() {
  const { user, logout } = useAuth();
  const [materiasAsignadas, setMateriasAsignadas] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  
  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getEstudianteMateria();
        setMateriasAsignadas(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMsg({ type: 'error', text: 'Las nuevas contraseñas no coinciden' });
    }
    try {
      await api.changePassword(currentPassword, newPassword);
      setMsg({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-teal-50/50 text-teal-950 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-teal-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-teal-600" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-teal-900">Portal Estudiantil</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${showProfile ? 'bg-teal-100 text-teal-800' : 'text-teal-600 hover:bg-teal-50'}`}
            >
              Mi Perfil
            </button>
            <div className="h-6 w-px bg-teal-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{user.nombre} {user.apellido}</span>
              <span className="px-2.5 py-1 text-xs font-bold bg-teal-100 rounded-full text-teal-800">
                {user.matricula}
              </span>
            </div>
            <button onClick={logout} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {showProfile ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-teal-100 p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-teal-50">
              <KeyRound className="w-6 h-6 text-teal-500" />
              <h2 className="text-lg font-bold">Cambiar Contraseña</h2>
            </div>
            
            {msg.text && (
              <div className={`mb-6 p-3 rounded-lg text-sm font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-teal-50 text-teal-600 border border-teal-100'}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-teal-800 mb-1">Contraseña Actual</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full bg-teal-50/50 border border-teal-100 rounded-lg px-4 py-2 text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-800 mb-1">Nueva Contraseña</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} className="w-full bg-teal-50/50 border border-teal-100 rounded-lg px-4 py-2 text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-medium text-teal-800 mb-1">Confirmar Nueva Contraseña</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} className="w-full bg-teal-50/50 border border-teal-100 rounded-lg px-4 py-2 text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow" />
              </div>
              <button type="submit" className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg transition-colors">
                Actualizar Contraseña
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-teal-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-500" /> Mis Calificaciones
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materiasAsignadas.map(em => (
                <div key={em.id} className="bg-white rounded-xl p-6 border border-teal-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-teal-950">{em.materias?.nombre}</h3>
                      <p className="text-sm text-teal-600/80">{em.materias?.descripcion}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-teal-50 flex items-end justify-between">
                    <span className="text-sm font-medium text-teal-600">Calificación final:</span>
                    <span className={`text-2xl font-black ${em.calificacion === null ? 'text-slate-300' : 'text-teal-600'}`}>
                      {em.calificacion === null ? 'Sin calificar' : em.calificacion}
                    </span>
                  </div>
                </div>
              ))}
              
              {materiasAsignadas.length === 0 && (
                <div className="col-span-full p-8 text-center text-teal-600/60 bg-white rounded-xl border border-teal-100 border-dashed">
                  No tienes materias asignadas actualmente.
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
