import React, { useState } from 'react';
import { useStudents } from '../../hooks/useStudents';
import { useGrades } from '../../hooks/useGrades';
import { Search, FileText } from 'lucide-react';

const GradeHistory = () => {
  const { students } = useStudents();
  const { grades } = useGrades();
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const filteredGrades = selectedStudentId 
    ? grades.filter(g => g.studentId === selectedStudentId)
    : grades;

  // Sort by date, newest first
  const sortedGrades = [...filteredGrades].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Historial de Calificaciones</h2>
          <p className="text-slate-500 mt-1">Registro continuo de notas de los estudiantes.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-md flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Filtrar por estudiante:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            >
              <option value="">Todos los estudiantes</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.matricula} - {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Estudiante (Matrícula)</th>
                <th className="px-6 py-3 font-medium">Materia</th>
                <th className="px-6 py-3 font-medium text-right">Calificación</th>
                <th className="px-6 py-3 font-medium text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedGrades.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText size={48} className="mb-4 text-slate-300" />
                      <p className="text-base font-medium text-slate-600">No hay registros de calificaciones</p>
                      <p className="text-sm mt-1">Intenta cambiar los filtros de búsqueda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedGrades.map((grade) => {
                  const student = students.find(s => s.id === grade.studentId);
                  const numGrade = Number(grade.grade);
                  const isPassed = numGrade >= 70;
                  
                  return (
                    <tr key={grade.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {new Date(grade.date).toLocaleDateString()} {new Date(grade.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {student ? `${student.firstName} ${student.lastName} (${student.matricula})` : 'Estudiante Desconocido'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{grade.subject}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800">
                        {grade.grade}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {isPassed ? 'Aprobado' : 'Reprobado'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradeHistory;
