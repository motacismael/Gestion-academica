import React, { useState, useMemo } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useGrades } from '../hooks/useGrades';
import { useToast } from '../context/ToastContext';
import { LogIn, LogOut, BookOpen, TrendingUp, Award, Calendar } from 'lucide-react';

const StudentPortal = () => {
  const { students } = useStudents();
  const { getGradesByStudent } = useGrades();
  const { showError, showSuccess } = useToast();

  const [matriculaInput, setMatriculaInput] = useState('');
  const [currentStudent, setCurrentStudent] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!matriculaInput.trim()) {
      showError('Por favor, ingresa tu matrícula.');
      return;
    }

    const student = students.find((s) => s.matricula === matriculaInput.trim());
    if (student) {
      setCurrentStudent(student);
      setMatriculaInput('');
      showSuccess(`Bienvenido, ${student.firstName}`);
    } else {
      showError('Matrícula no encontrada. Verifica e intenta de nuevo.');
    }
  };

  const handleLogout = () => {
    setCurrentStudent(null);
    showSuccess('Sesión cerrada correctamente.');
  };

  const studentGrades = useMemo(() => {
    if (!currentStudent) return [];
    return getGradesByStudent(currentStudent.id);
  }, [currentStudent, getGradesByStudent]);

  const stats = useMemo(() => {
    const totalGrades = studentGrades.length;
    let averageGrade = 0;
    let passedCount = 0;

    if (totalGrades > 0) {
      const sum = studentGrades.reduce((acc, curr) => acc + Number(curr.grade), 0);
      averageGrade = (sum / totalGrades).toFixed(1);
      passedCount = studentGrades.filter((g) => Number(g.grade) >= 70).length;
    }

    return {
      total: totalGrades,
      average: averageGrade,
      passed: passedCount
    };
  }, [studentGrades]);

  if (!currentStudent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mb-4">
              <BookOpen size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Acceso Estudiantes</h2>
            <p className="text-slate-500 mt-2">Ingresa tu matrícula para ver tus calificaciones</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="matricula" className="block text-sm font-medium text-slate-700 mb-2">
                Matrícula
              </label>
              <input
                id="matricula"
                type="text"
                value={matriculaInput}
                onChange={(e) => setMatriculaInput(e.target.value)}
                placeholder="Ej. 20230001"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              <LogIn size={20} />
              Acceder al Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Hola, {currentStudent.firstName} {currentStudent.lastName}
          </h2>
          <p className="text-slate-500 mt-1">Matrícula: <span className="font-medium text-slate-700">{currentStudent.matricula}</span></p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Asignaturas</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Promedio General</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.average}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Aprobadas</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.passed} de {stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-800">Historial de Calificaciones</h3>
        </div>
        
        {studentGrades.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No tienes calificaciones registradas en este momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Asignatura</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Calificación</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentGrades.map((grade) => {
                  const numGrade = Number(grade.grade);
                  const isPassed = numGrade >= 70;
                  return (
                    <tr key={grade.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{grade.subject}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(grade.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-700">{grade.grade}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {isPassed ? 'Aprobado' : 'Reprobado'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPortal;
