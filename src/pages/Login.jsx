import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  
  const [identificador, setIdentificador] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres');
      return;
    }

    try {
      const user = await login(identificador, password);
      
      switch (user.rol) {
        case 'superadmin':
          navigate('/superadmin');
          break;
        case 'profesor':
          navigate('/profesor');
          break;
        case 'estudiante':
          navigate('/estudiante');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres');
      return;
    }
    if (!/^\d{9}$/.test(matricula)) {
      setError('La matrícula debe tener exactamente 9 dígitos');
      return;
    }

    try {
      await api.register({ nombre, apellido, matricula, password });
      setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
      setIsLogin(true);
      setIdentificador(matricula);
      setPassword('');
      setNombre('');
      setApellido('');
      setMatricula('');
    } catch (err) {
      setError(err.message || 'Error en el registro');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4">
      <div className="max-w-md w-full bg-zinc-800 rounded-xl shadow-2xl p-8 border border-zinc-700">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          {isLogin ? 'Iniciar Sesión' : 'Registro Estudiante'}
        </h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 p-3 rounded-lg mb-6 text-sm text-center">
            {success}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email o Matrícula</label>
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                placeholder="Ingresa tu identificador"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors">
              Entrar
            </button>
            <p className="text-center text-sm text-zinc-400 mt-4">
              ¿No tienes cuenta? <button type="button" onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} className="text-indigo-400 hover:underline focus:outline-none">Regístrate como estudiante</button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Nombre</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Apellido</label>
                <input type="text" value={apellido} onChange={e => setApellido(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Matrícula (9 dígitos)</label>
              <input type="text" value={matricula} onChange={e => setMatricula(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="123456789" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="••••••••" required />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors mt-2">
              Registrar
            </button>
            <p className="text-center text-sm text-zinc-400 mt-4">
              ¿Ya tienes cuenta? <button type="button" onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} className="text-indigo-400 hover:underline focus:outline-none">Inicia sesión</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
