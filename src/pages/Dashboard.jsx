import React, { useMemo } from 'react';
import { useStudents } from '../hooks/useStudents';
import { useGrades } from '../hooks/useGrades';
import { Users, GraduationCap, TrendingUp, Award } from 'lucide-react';

const Dashboard = () => {
  const { students } = useStudents();
  const { grades } = useGrades();

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalGrades = grades.length;
    
    let averageGrade = 0;
    let passedCount = 0;

    if (totalGrades > 0) {
      const sum = grades.reduce((acc, curr) => acc + Number(curr.grade), 0);
      averageGrade = (sum / totalGrades).toFixed(1);
      passedCount = grades.filter((g) => Number(g.grade) >= 70).length;
    }

    const passRate = totalGrades > 0 ? ((passedCount / totalGrades) * 100).toFixed(0) : 0;

    return [
      { title: 'Total Estudiantes', value: totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
      { title: 'Calificaciones Registradas', value: totalGrades, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-100' },
      { title: 'Promedio General', value: averageGrade, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
      { title: 'Tasa de Aprobación', value: `${passRate}%`, icon: Award, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];
  }, [students, grades]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Resumen General</h2>
        <p className="text-slate-500 mt-1">Vista rápida del estado de la academia.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm mt-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Actividad Reciente</h3>
        {grades.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay calificaciones registradas aún.</p>
        ) : (
          <div className="space-y-4">
            {grades.slice(-5).reverse().map((grade) => {
              const student = students.find(s => s.id === grade.studentId);
              return (
                <div key={grade.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-slate-800">{student ? `${student.firstName} ${student.lastName}` : 'Estudiante Desconocido'}</p>
                    <p className="text-sm text-slate-500">{grade.subject}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${Number(grade.grade) >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {grade.grade}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{new Date(grade.date).toLocaleDateString()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
