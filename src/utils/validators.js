/**
 * Validates if the given string is exactly 9 numeric digits.
 * @param {string} matricula 
 * @returns {boolean}
 */
export const isValidMatriculaFormat = (matricula) => {
  const regex = /^\d{9}$/;
  return regex.test(matricula);
};

/**
 * Validates if the given grade is a number between 0 and 100.
 * @param {number|string} grade 
 * @returns {boolean}
 */
export const isValidGrade = (grade) => {
  const numGrade = Number(grade);
  if (isNaN(numGrade)) return false;
  return numGrade >= 0 && numGrade <= 100;
};
