import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Users, BookOpen, UserPlus, LogOut, Shield, Pencil, Trash2, X, Plus, GraduationCap } from 'lucide-react';

export default function SuperadminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [view, setView] = useState('overview'); // overview | usuarios | materias
  const [modal, setModal] = useState(null); // null | 'createUser' | 'editUser' | 'createMateria' | 'editMateria' | 'assignMateria'
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchAll = async () => {
    try {
      const [u, m] = await Promise.all([api.getUsers(), api.getMaterias()]);
      setUsers(u);
      setMaterias(m);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleDeleteUser = async (id) => {
    if (!confirm('¿Eliminar usuario permanentemente?')) return;
    await api.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
    showToast('Usuario eliminado');
  };

  const handleDeleteMateria = async (id) => {
    if (!confirm('¿Eliminar materia?')) return;
    await api.deleteMateria(id);
    setMaterias(prev => prev.filter(m => m.id !== id));
    showToast('Materia eliminada');
  };

  const stats = {
    profesores: users.filter(u => u.roles?.nombre === 'profesor').length,
    estudiantes: users.filter(u => u.roles?.nombre === 'estudiante').length,
    superadmins: users.filter(u => u.roles?.nombre === 'superadmin').length,
    materias: materias.length
  };

  const profesores = users.filter(u => u.roles?.nombre === 'profesor');
  const estudiantes = users.filter(u => u.roles?.nombre === 'estudiante');
  const superadmins = users.filter(u => u.roles?.nombre === 'superadmin');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      {toast && <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">{toast}</div>}

      {/* Header */}
      <header className="bg-slate-800/70 backdrop-blur-md border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-500/20 rounded-lg"><Shield className="w-5 h-5 text-indigo-400" /></div>
            <nav className="flex gap-1">
              {[['overview','Resumen'],['usuarios','Usuarios'],['materias','Materias']].map(([k,l]) => (
                <button key={k} onClick={() => setView(k)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${view===k ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                  {l}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm">{user.nombre} {user.apellido}</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-indigo-500/30 rounded-full text-indigo-300">Superadmin</span>
            <button onClick={logout} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* OVERVIEW */}
        {view === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard icon={<GraduationCap />} title="Profesores" value={stats.profesores} color="bg-blue-500/10 text-blue-400 border-blue-500/20" onClick={() => setView('usuarios')} />
              <StatCard icon={<Users />} title="Estudiantes" value={stats.estudiantes} color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" onClick={() => setView('usuarios')} />
              <StatCard icon={<BookOpen />} title="Materias" value={stats.materias} color="bg-purple-500/10 text-purple-400 border-purple-500/20" onClick={() => setView('materias')} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-white">Últimos Usuarios</h2>
                  <button onClick={() => setView('usuarios')} className="text-sm text-indigo-400 hover:underline">Ver todos</button>
                </div>
                <div className="space-y-2">
                  {users.slice(0,5).map(u => (
                    <div key={u.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-xl border border-slate-700/50">
                      <div><p className="font-medium text-white text-sm">{u.nombre} {u.apellido}</p><p className="text-xs text-slate-400">{u.matricula || u.email}</p></div>
                      <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">{u.roles?.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-white">Materias</h2>
                  <button onClick={() => setView('materias')} className="text-sm text-indigo-400 hover:underline">Ver todas</button>
                </div>
                <div className="space-y-2">
                  {materias.slice(0,5).map(m => (
                    <div key={m.id} className="p-3 bg-slate-800 rounded-xl border border-slate-700/50">
                      <p className="font-medium text-white text-sm">{m.nombre}</p>
                      <p className="text-xs text-slate-400">{m.usuarios ? `${m.usuarios.nombre} ${m.usuarios.apellido}` : '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USUARIOS */}
        {view === 'usuarios' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Gestión de Usuarios</h2>
              <button onClick={() => { setSelected({ roleName: 'estudiante' }); setModal('createUser'); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
                <UserPlus className="w-4 h-4" /> Crear Usuario
              </button>
            </div>

            {/* Superadmins */}
            <Section title="Superadmins" count={superadmins.length} color="text-indigo-400">
              <Table
                headers={['Nombre','Email','Acciones']}
                rows={superadmins.map(u => [
                  `${u.nombre} ${u.apellido}`,
                  u.email,
                  <RowActions key={u.id}
                    onEdit={() => { setSelected(u); setModal('editUser'); }}
                    onDelete={() => handleDeleteUser(u.id)}
                  />
                ])}
              />
            </Section>

            {/* Profesores */}
            <Section title="Profesores" count={profesores.length} color="text-blue-400">
              <Table
                headers={['Nombre','Email','Acciones']}
                rows={profesores.map(u => [
                  `${u.nombre} ${u.apellido}`,
                  u.email,
                  <RowActions key={u.id}
                    onEdit={() => { setSelected(u); setModal('editUser'); }}
                    onDelete={() => handleDeleteUser(u.id)}
                  />
                ])}
              />
            </Section>

            {/* Estudiantes */}
            <Section title="Estudiantes" count={estudiantes.length} color="text-emerald-400">
              <Table
                headers={['Nombre','Matrícula','Acciones']}
                rows={estudiantes.map(u => [
                  `${u.nombre} ${u.apellido}`,
                  u.matricula,
                  <RowActions key={u.id}
                    onEdit={() => { setSelected(u); setModal('editUser'); }}
                    onDelete={() => handleDeleteUser(u.id)}
                  />
                ])}
              />
            </Section>
          </div>
        )}

        {/* MATERIAS */}
        {view === 'materias' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Gestión de Materias</h2>
              <button onClick={() => { setSelected(null); setModal('createMateria'); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
                <Plus className="w-4 h-4" /> Nueva Materia
              </button>
            </div>
            <Table
              headers={['Materia','Descripción','Profesor','Acciones']}
              rows={materias.map(m => [
                m.nombre,
                m.descripcion || '—',
                m.usuarios ? `${m.usuarios.nombre} ${m.usuarios.apellido}` : '—',
                <RowActions key={m.id}
                  onEdit={() => { setSelected(m); setModal('editMateria'); }}
                  onDelete={() => handleDeleteMateria(m.id)}
                />
              ])}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      {modal === 'createUser' && (
        <UserFormModal
          title="Crear Usuario"
          roleName={selected?.roleName}
          onClose={closeModal}
          onSave={async (data) => {
            setLoading(true);
            try {
              const newUser = await api.createUser(data);
              setUsers(prev => [...prev, newUser]);
              showToast('Usuario creado exitosamente');
              closeModal();
            } catch (e) { alert(e.message); }
            setLoading(false);
          }}
          loading={loading}
        />
      )}
      {modal === 'editUser' && (
        <EditUserModal
          user={selected}
          onClose={closeModal}
          onSave={async (data) => {
            setLoading(true);
            try {
              const updated = await api.updateUser(selected.id, data);
              setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
              showToast('Usuario actualizado');
              closeModal();
            } catch (e) { alert(e.message); }
            setLoading(false);
          }}
          loading={loading}
        />
      )}
      {modal === 'createMateria' && (
        <MateriaFormModal
          title="Nueva Materia"
          profesores={profesores}
          onClose={closeModal}
          onSave={async (data) => {
            setLoading(true);
            try {
              const newM = await api.createMateria(data);
              setMaterias(prev => [...prev, newM]);
              showToast('Materia creada');
              closeModal();
            } catch (e) { alert(e.message); }
            setLoading(false);
          }}
          loading={loading}
        />
      )}
      {modal === 'editMateria' && (
        <MateriaFormModal
          title="Editar Materia"
          materia={selected}
          profesores={profesores}
          onClose={closeModal}
          onSave={async (data) => {
            setLoading(true);
            try {
              const updated = await api.updateMateria(selected.id, data);
              setMaterias(prev => prev.map(m => m.id === updated.id ? updated : m));
              showToast('Materia actualizada');
              closeModal();
            } catch (e) { alert(e.message); }
            setLoading(false);
          }}
          loading={loading}
        />
      )}
    </div>
  );
}

function StatCard({ icon, title, value, color, onClick }) {
  return (
    <div onClick={onClick} className={`p-6 rounded-2xl border cursor-pointer transition-transform hover:scale-[1.02] ${color}`}>
      <div className="flex justify-between items-start">
        <div><p className="text-sm font-medium opacity-80 mb-1">{title}</p><h3 className="text-4xl font-bold">{value}</h3></div>
        <div className="p-3 rounded-xl bg-white/5">{icon}</div>
      </div>
    </div>
  );
}

function Section({ title, count, color, children }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center gap-2">
        <h3 className={`font-semibold ${color}`}>{title}</h3>
        <span className="text-xs text-slate-500 font-medium">({count})</span>
      </div>
      {children}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-slate-700/50">
          {headers.map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>)}
        </tr></thead>
        <tbody className="divide-y divide-slate-700/30">
          {rows.length === 0 ? (
            <tr><td colSpan={headers.length} className="px-6 py-6 text-center text-slate-500">Sin datos</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-700/20 transition-colors">
              {row.map((cell, j) => <td key={j} className="px-6 py-3 text-slate-300">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded transition-colors"><Pencil className="w-4 h-4" /></button>
      <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

function ModalWrapper({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function UserFormModal({ title, roleName, onClose, onSave, loading }) {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', matricula: '', password: '', roleName: roleName || 'estudiante' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isEst = form.roleName === 'estudiante';

  return (
    <ModalWrapper title={title} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Rol</label>
          <select value={form.roleName} onChange={e => set('roleName', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="estudiante">Estudiante</option>
            <option value="profesor">Profesor</option>
            <option value="superadmin">Superadmin</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" value={form.nombre} onChange={v => set('nombre', v)} />
          <Field label="Apellido" value={form.apellido} onChange={v => set('apellido', v)} />
        </div>
        {isEst
          ? <Field label="Matrícula (9 dígitos)" value={form.matricula} onChange={v => set('matricula', v)} placeholder="123456789" />
          : <Field label="Email" type="email" value={form.email} onChange={v => set('email', v)} />
        }
        <Field label="Contraseña inicial" type="password" value={form.password} onChange={v => set('password', v)} />
        <button disabled={loading} onClick={() => onSave(form)}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors">
          {loading ? 'Guardando...' : 'Crear'}
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
        <Field label="Nueva contraseña (opcional)" type="password" value={form.password} onChange={v => set('password', v)} placeholder="Dejar vacío para no cambiar" />
        <button disabled={loading} onClick={() => onSave(form)}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors">
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </ModalWrapper>
  );
}

function MateriaFormModal({ title, materia, profesores, onClose, onSave, loading }) {
  const [form, setForm] = useState({ nombre: materia?.nombre || '', descripcion: materia?.descripcion || '', profesor_id: materia?.usuarios?.id || '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <ModalWrapper title={title} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Nombre de la Materia" value={form.nombre} onChange={v => set('nombre', v)} />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción</label>
          <textarea rows={3} value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Profesor</label>
          <select value={form.profesor_id} onChange={e => set('profesor_id', e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">— Seleccionar —</option>
            {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
          </select>
        </div>
        <button disabled={loading} onClick={() => onSave(form)}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </ModalWrapper>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
    </div>
  );
}
