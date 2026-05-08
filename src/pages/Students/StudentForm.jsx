import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { isValidMatriculaFormat } from '../../utils/validators';

const StudentForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    matricula: '',
    firstName: '',
    lastName: '',
    email: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.matricula) {
      newErrors.matricula = 'La matrícula es requerida.';
    } else if (!isValidMatriculaFormat(formData.matricula)) {
      newErrors.matricula = 'La matrícula debe tener exactamente 9 dígitos numéricos.';
    }
    
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido.';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido.';
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo no es válido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Matrícula"
        name="matricula"
        value={formData.matricula}
        onChange={handleChange}
        error={errors.matricula}
        placeholder="Ej: 100408999"
        maxLength={9}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          placeholder="Juan"
        />
        <Input
          label="Apellido"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          placeholder="Pérez"
        />
      </div>

      <Input
        label="Correo Electrónico"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="juan.perez@ejemplo.com"
      />

      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
