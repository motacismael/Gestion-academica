import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Users, BookOpen, LogOut, Pencil, Trash2, X, Plus, Star } from 'lucide-react';

export default function ProfesorDashboard() {
  const { user, logout } = useAuth();
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [view, setView] = useState('overview'); // overview | materias | estudiantes | calificaciones
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchAll = async () => {
    try {
      const [m, u, a] = await Promise.all([api.getMaterias(), api.getUsers(), api.getEstudianteMateria()]);
      setMaterias(m);
      setEstudiantes(u.filter(x => x.roles?.nombre === 'estudiante'));
      setAsignaciones(a);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleDeleteMateria = async (id) => {
    if (!confirm('¿Eliminar materia?')) return;
    await api.deleteMateria(id);
    setMaterias(prev => prev.filter(m => m.id !== id));
    showToast('Materia eliminada');
  };

  // Materias del profesor logueado
  const misMaterias = materias.filter(m => m.usuarios?.id === user.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {toast && <div className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">{toast}</div>}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-indigo-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-100 rounded-lg"><BookOpen className="w-5 h-5 text-indigo-600" /></div>
            <nav className="flex gap-1">
              {[['overview','Resumen'],['materias','Materias'],['estudiantes','Estudiantes'],['calificaciones','Calificaciones']].map(([k,l]) => (
                <button key={k} onClick={() => setView(k)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${view===k ? 'bg-indigo-100 text-indigo-800' : 'text-slate-500 hover:text-slate-800'}`}>
                  {l}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-600">{user.nombre} {user.apellido}</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 rounded-full text-indigo-700">Profesor</span>
            <button onClick={logout} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* OVERVIEW */}
        {view === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard icon={<BookOpen />} title="Mis Materias" value={misMaterias.length} color="bg-indigo-50 text-indigo-600 border-indigo-100" onClick={() => setView('materias')} />
              <StatCard icon={<Users />} title="Estudiantes" value={estudiantes.length} color="bg-blue-50 text-blue-600 border-blue-100" onClick={() => setView('estudiantes')} />
              <StatCard icon={<Star />} title="Calificaciones Pendientes" value={asignaciones.filter(a => a.calificacion === null).length} color="bg-amber-50 text-amber-600 border-amber-100" onClick={() => setView('calificaciones')} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-indigo-50 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-indigo-950">Mis Materias</h2>
                  <button onClick={() => setView('materias')} className="text-sm text-indigo-500 hover:underline">Ver todas</button>
                </div>
                <div className="space-y-2">
                  {misMaterias.slice(0,4).map(m => (
                    <div key={m.id} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-50">
                      <p className="font-medium text-sm text-indigo-950">{m.nombre}</p>
                      <p className="text-xs text-slate-400">{m.descripcion || 'Sin descripción'}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-indigo-50 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-indigo-950">Últimos Estudiantes</h2>
                  <button onClick={() => setView('estudiantes')} className="text-sm text-indigo-500 hover:underline">Ver todos</button>
                </div>
                <div className="space-y-2">
                  {estudiantes.slice(0,4).map(e => (
                    <div key={e.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                      <p className="font-medium text-sm">{e.nombre} {e.apellido}</p>
                      <span className="text-xs font-mono text-slate-400">{e.matricula}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MATERIAS */}
        {view === 'materias' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-indigo-950">Mis Materias</h2>
              <button onClick={() => { setSelected(null); setModal('createMateria'); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
                <Plus className="w-4 h-4" /> Nueva Materia
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-indigo-50 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-indigo-50 bg-indigo-50/30">
                  {['Materia','Descripción','Acciones'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-indigo-50">
                  {misMaterias.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No tienes materias aún. Crea una.</td></tr>
                  ) : misMaterias.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-indigo-950">{m.nombre}</td>
                      <td className="px-6 py-3 text-slate-500">{m.descripcion || '—'}</td>
                      <td className="px-6 py-3"><div className="flex gap-2">
                        <button onClick={() => { setSelected(m); setModal('editMateria'); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteMateria(m.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ESTUDIANTES */}
        {view === 'estudiantes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-indigo-950">Estudiantes</h2>
              <button onClick={() => setModal('createEstudiante')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg">
                <Plus className="w-4 h-4" /> Nuevo Estudiante
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-indigo-50 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-indigo-50 bg-indigo-50/30">
                  {['Nombre','Matrícula','Acciones'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-indigo-50">
                  {estudiantes.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No hay estudiantes.</td></tr>
                  ) : estudiantes.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium">{e.nombre} {e.apellido}</td>
                      <td className="px-6 py-3 font-mono text-slate-500">{e.matricula}</td>
                      <td className="px-6 py-3"><div className="flex gap-2">
                        <button onClick={() => { setSelected(e); setModal('editEstudiante'); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(e); setModal('assignMateria'); }} className="px-2.5 py-1 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded font-medium">Asignar Materia</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CALIFICACIONES */}
        {view === 'calificaciones' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-indigo-950">Calificaciones</h2>
            <div className="bg-white rounded-2xl border border-indigo-50 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-indigo-50 bg-indigo-50/30">
                  {['Estudiante','Materia','Calificación','Acción'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-indigo-50">
                  {asignaciones.filter(a => misMaterias.some(m => m.id === a.materia_id)).length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No hay asignaciones en tus materias.</td></tr>
                  ) : asignaciones.filter(a => misMaterias.some(m => m.id === a.materia_id)).map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium">{a.usuarios?.nombre} {a.usuarios?.apellido}</td>
                      <td className="px-6 py-3 text-slate-500">{a.materias?.nombre}</td>
                      <td className="px-6 py-3">
                        <span className={`font-bold text-lg ${a.calificacion === null ? 'text-slate-300' : 'text-indigo-600'}`}>
                          {a.calificacion === null ? 'Sin calificar' : a.calificacion}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <button onClick={() => { setSelected(a); setModal('editGrade'); }}
                          className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg">
                          {a.calificacion === null ? 'Calificar' : 'Editar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {modal === 'createMateria' && (
        <MateriaFormModal title="Nueva Materia" onClose={closeModal} loading={loading}
          onSave={async (data) => {
            setLoading(true);
            try {
              const m = await api.createMateria(data);
              setMaterias(prev => [...prev, m]);
              showToast('Materia creada');
              closeModal();
            } catch (e) { alert(e.message); }
            setLoading(false);
          }} />
      )}
      {modal === 'editMateria' && (
        <MateriaFormModal title="Editar Materia" materia={selected} onClose={closeModal} loading={loading}
          onSave={async (data) => {
            setLoading(true);
            try {
              const m = await api.updateMateria(selected.id, data);
              setMaterias(prev => prev.map(x => x.id === m.id ? m : x));
              showToast('Materia actualizada');
              closeModal();
            } catch (e) { alert(e.message); }
            setLoading(false);
          }} />
      )}
      {modal === 'createEstudiante' && (
        <UserFormModal title="Nuevo Estudiante" onClose={closeModal} loading={loading}
          onSave={async (data) => {
            setLoading(true);
            try {
              const u = await api.createUser({ ...data, roleName: 'estudiante' });
              setEstudiantes(prev => [...prev, u]);
              showToast('Estudiante creado');
              closeModal();
            } catch (e) { alert(e.message); }
            setLoading(false);
          }} />
      )}
      {modal === 'editEstudiante' && (
        <EditUserModal user={selected} onClose={closeModal} loading={loading}
          onSave={async (data) => {
            setLoading(true);
            try {
              const u = await api.updateUser(selected.id, data);
              setEstudiantes(prev => prev.map(x => x.id === u.id ? u : x));
              showToast('Estudiante actualizado');
              closeModal();
            } catch (e) { alert(e.message); }
            setLoading(false);
          }} />
      )}
      {modal === 'assignMateria' && (
        <AssignMateriaModal estudiante={selected} materias={misMaterias} onClose={closeModal} loading={loading}
          onSave={async (data) => {
            setLoading(true);
            try {
              const a = await api.assignMateria(data);
              setAsignaciones(prev => [...prev, a]);
              showToast('Materia asignada');
              closeModal();
            } catch (e) { alert(e.message); }
            setLoading(false);
          }} />
      )}
      {modal === 'editGrade' && (
        <GradeModal asignacion={selected} onClose={closeModal} loading={loading}
          onSave={async (cal) => {
            setLoading(true);
            try {
              const updated = await api.assignGrade(selected.id, cal);
              setAsignaciones(prev => prev.map(a => a.id === updated.id ? { ...a, calificacion: updated.calificacion } : a));
              showToast('Calificación guardada');
              closeModal();
            } catch (e) { alert(e.message); }
            setLoading(false);
          }} />
      )}
    </div>
  );
}

function StatCard({ icon, title, value, color, onClick }) {
  return (
    <div onClick={onClick} className={`p-6 rounded-2xl border cursor-pointer shadow-sm hover:shadow-md transition-all ${color}`}>
      <div className="flex justify-between items-start">
        <div><p className="text-sm font-medium opacity-70 mb-1">{title}</p><h3 className="text-3xl font-bold">{value}</h3></div>
        <div className="p-3 rounded-xl bg-white/50">{icon}</div>
      </div>
    </div>
  );
}

function ModalWrapper({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-indigo-100 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-indigo-50">
          <h3 className="text-lg font-bold text-indigo-950">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  );
}

function MateriaFormModal({ title, materia, onClose, onSave, loading }) {
  const [form, setForm] = useState({ nombre: materia?.nombre || '', descripcion: materia?.descripcion || '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <ModalWrapper title={title} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Nombre" value={form.nombre} onChange={v => set('nombre', v)} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
          <textarea rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button disabled={loading} onClick={() => onSave(form)} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </ModalWrapper>
  );
}

function UserFormModal({ title, onClose, onSave, loading }) {
  const [form, setForm] = useState({ nombre: '', apellido: '', matricula: '', password: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <ModalWrapper title={title} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" value={form.nombre} onChange={v => set('nombre', v)} />
          <Field label="Apellido" value={form.apellido} onChange={v => set('apellido', v)} />
        </div>
        <Field label="Matrícula (9 dígitos)" value={form.matricula} onChange={v => set('matricula', v)} placeholder="123456789" />
        <Field label="Contraseña inicial" type="password" value={form.password} onChange={v => set('password', v)} />
        <button disabled={loading} onClick={() => onSave(form)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-lg">
          {loading ? 'Guardando...' : 'Crear Estudiante'}
        </button>
      </div>
    </ModalWrapper>
  );
}

function EditUserModal({ user, onClose, onSave, loading }) {
  const [form, setForm] = useState({ nombre: user.nombre, apellido: user.apellido, password: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <ModalWrapper title="Editar Usuario" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" value={form.nombre} onChange={v => set('nombre', v)} />
          <Field label="Apellido" value={form.apellido} onChange={v => set('apellido', v)} />
        </div>
        <Field label="Nueva contraseña (opcional)" type="password" value={form.password} onChange={v => set('password', v)} placeholder="Vacío = no cambiar" />
        <button disabled={loading} onClick={() => onSave(form)} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </ModalWrapper>
  );
}

function AssignMateriaModal({ estudiante, materias, onClose, onSave, loading }) {
  const [materiaId, setMateriaId] = useState('');
  return (
    <ModalWrapper title={`Asignar Materia a ${estudiante?.nombre}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Materia</label>
          <select value={materiaId} onChange={e => setMateriaId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">— Seleccionar —</option>
            {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
        <button disabled={loading || !materiaId} onClick={() => onSave({ estudiante_id: estudiante.id, materia_id: materiaId })}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-lg">
          {loading ? 'Asignando...' : 'Asignar'}
        </button>
      </div>
    </ModalWrapper>
  );
}

function GradeModal({ asignacion, onClose, onSave, loading }) {
  const [cal, setCal] = useState(asignacion?.calificacion ?? '');
  return (
    <ModalWrapper title="Asignar Calificación" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-500">{asignacion?.materias?.nombre}</p>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Calificación</label>
          <input type="number" min={0} max={100} value={cal} onChange={e => setCal(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button disabled={loading || cal === ''} onClick={() => onSave(Number(cal))}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg">
          {loading ? 'Guardando...' : 'Guardar Calificación'}
        </button>
      </div>
    </ModalWrapper>
  );
}
