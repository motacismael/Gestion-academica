import { useState, useEffect, useCallback } from 'react';
import { getStorageData, setStorageData, StorageKeys } from '../utils/storage';

export const useGrades = () => {
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    setGrades(getStorageData(StorageKeys.GRADES));
  }, []);

  const addGrade = useCallback((gradeData) => {
    setGrades((prev) => {
      const newGrade = {
        ...gradeData,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      const newGradesList = [...prev, newGrade];
      setStorageData(StorageKeys.GRADES, newGradesList);
      return newGradesList;
    });
  }, []);

  const getGradesByStudent = useCallback((studentId) => {
    return grades.filter((g) => g.studentId === studentId);
  }, [grades]);

  return {
    grades,
    addGrade,
    getGradesByStudent,
  };
};
