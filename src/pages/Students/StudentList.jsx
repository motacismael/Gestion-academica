import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useStudents } from '../../hooks/useStudents';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import StudentForm from './StudentForm';

const StudentList = () => {
  const { students, addStudent, updateStudent, deleteStudent } = useStudents();
  const { showSuccess, showError } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const filteredStudents = students.filter(student => 
    student.matricula.includes(searchTerm) ||
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (student = null) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSubmit = (formData) => {
    try {
      if (editingStudent) {
        updateStudent(editingStudent.id, formData);
        showSuccess('Estudiante actualizado exitosamente');
      } else {
        addStudent(formData);
        showSuccess('Estudiante registrado exitosamente');
      }
      handleCloseModal();
    } catch (error) {
      showError(error.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este estudiante?')) {
      deleteStudent(id);
      showSuccess('Estudiante eliminado exitosamente');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Estudiantes</h2>
          <p className="text-slate-500 mt-1">Gestione la información de los estudiantes.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="shrink-0">
          <Plus size={20} className="mr-2" />
          Nuevo Estudiante
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por matrícula, nombre o apellido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Matrícula</th>
                <th className="px-6 py-3 font-medium">Nombre Completo</th>
                <th className="px-6 py-3 font-medium">Correo Electrónico</th>
                <th className="px-6 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    No se encontraron estudiantes.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{student.matricula}</td>
                    <td className="px-6 py-4">{`${student.firstName} ${student.lastName}`}</td>
                    <td className="px-6 py-4 text-slate-600">{student.email}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(student)}
                          className="p-2 text-slate-400 hover:text-navy-600 hover:bg-navy-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
      >
        <StudentForm
          initialData={editingStudent}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default StudentList;
