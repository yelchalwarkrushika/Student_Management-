export function addStudent(students, student) {
  const name = String(student.name ?? '').trim();
  const roll = String(student.roll ?? '').trim();
  const course = String(student.course ?? '').trim();
  if (!name || !roll || !course) throw new Error('All fields are required');
  if (students.some(s => s.roll === roll)) throw new Error('Roll number already exists');
  return [...students, { name, roll, course }];
}
export function searchStudents(students, query) {
  const normalizedQuery = String(query ?? '').trim().toLowerCase();
  return students.filter(student => `${student.id || ''} ${student.studentId || ''} ${student.rollNumber || student.roll || ''} ${student.name || ''} ${student.email || ''}`.toLowerCase().includes(normalizedQuery));
}
export function deleteStudent(students, roll) {
  return students.filter(s => s.roll !== roll);
}
