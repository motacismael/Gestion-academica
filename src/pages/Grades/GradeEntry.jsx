import React, { useState } from 'react';
import { useStudents } from '../../hooks/useStudents';
import { useGrades } from '../../hooks/useGrades';
import { useToast } from '../../context/ToastContext';
import { isValidGrade } from '../../utils/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const GradeEntry = () => {
  const { students } = useStudents();
  const { addGrade } = useGrades();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    grade: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.studentId) newErrors.studentId = 'Debe seleccionar un estudiante.';
    if (!formData.subject.trim()) newErrors.subject = 'La materia es requerida.';
    
    if (formData.grade === '') {
      newErrors.grade = 'La calificación es requerida.';
    } else if (!isValidGrade(formData.grade)) {
      newErrors.grade = 'La calificación debe ser un valor entre 0 y 100.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        addGrade(formData);
        showSuccess('Calificación registrada exitosamente');
        setFormData({ ...formData, grade: '', subject: '' }); // Reset only grade and subject for quick entry
      } catch (error) {
        showError('Error al registrar la calificación');
      }
    } else {
      if (errors.grade && formData.grade !== '' && !isValidGrade(formData.grade)) {
        showError('Validación estricta fallida: ' + errors.grade);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Ingreso de Calificaciones</h2>
        <p className="text-slate-500 mt-1">Panel de evaluación para docentes.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-slate-700">Estudiante</label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className={`flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent ${
                errors.studentId ? 'border-red-500 focus:ring-red-500' : ''
              }`}
            >
              <option value="">Seleccione un estudiante...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.matricula} - {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
            {errors.studentId && <span className="text-sm text-red-500">{errors.studentId}</span>}
          </div>

          <Input
            label="Materia"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            error={errors.subject}
            placeholder="Ej: Matemáticas"
          />

          <Input
            label="Calificación (0 - 100)"
            name="grade"
            type="number"
            min="0"
            max="100"
            value={formData.grade}
            onChange={handleChange}
            error={errors.grade}
            placeholder="85"
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              Registrar Calificación
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeEntry;
