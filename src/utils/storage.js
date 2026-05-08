export const StorageKeys = {
  STUDENTS: 'academic_sys_students',
  GRADES: 'academic_sys_grades',
};

export const getStorageData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return [];
  }
};

export const setStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage', error);
    return false;
  }
};
