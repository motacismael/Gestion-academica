import { useState, useEffect, useCallback } from 'react';
import { getStorageData, setStorageData, StorageKeys } from '../utils/storage';

export const useStudents = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    setStudents(getStorageData(StorageKeys.STUDENTS));
  }, []);

  const addStudent = useCallback((student) => {
    setStudents((prev) => {
      const isDuplicate = prev.some((s) => s.matricula === student.matricula);
      if (isDuplicate) {
        throw new Error('Ya existe un estudiante con esta matrícula.');
      }
      
      const newStudents = [...prev, { ...student, id: Date.now().toString() }];
      setStorageData(StorageKeys.STUDENTS, newStudents);
      return newStudents;
    });
  }, []);

  const updateStudent = useCallback((id, updatedData) => {
    setStudents((prev) => {
      const newStudents = prev.map((s) => {
        if (s.id === id) {
          // Si cambia la matrícula, validar que no choque con otra
          if (updatedData.matricula && updatedData.matricula !== s.matricula) {
            const isDuplicate = prev.some(
              (other) => other.id !== id && other.matricula === updatedData.matricula
            );
            if (isDuplicate) {
              throw new Error('La nueva matrícula ya está en uso por otro estudiante.');
            }
          }
          return { ...s, ...updatedData };
        }
        return s;
      });
      setStorageData(StorageKeys.STUDENTS, newStudents);
      return newStudents;
    });
  }, []);

  const deleteStudent = useCallback((id) => {
    setStudents((prev) => {
      const newStudents = prev.filter((s) => s.id !== id);
      setStorageData(StorageKeys.STUDENTS, newStudents);
      return newStudents;
    });
  }, []);

  return {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
  };
};
