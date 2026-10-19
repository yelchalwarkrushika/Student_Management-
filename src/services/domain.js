const assessmentMaximums = { internal: 20, assignment: 20, examination: 60 };
const gradeBands = [
  { minimum: 90, grade: 'A+' },
  { minimum: 80, grade: 'A' },
  { minimum: 70, grade: 'B+' },
  { minimum: 60, grade: 'B' },
  { minimum: 50, grade: 'C' },
  { minimum: 40, grade: 'D' },
  { minimum: 0, grade: 'F' },
];

export function calculateAttendancePercentage(records) {
  if (!records.length) return 0;
  const present = records.filter(record => record.status === 'Present').length;
  return Math.round((present / records.length) * 100);
}

export function calculateGrade(percentage) {
  return gradeBands.find(band => percentage >= band.minimum).grade;
}

export function calculateMarks({ internal, assignment, examination }) {
  if ([internal, assignment, examination].some(value => value === '' || value === null || value === undefined)) {
    throw new Error('Enter marks for all three assessment components.');
  }
  const scores = { internal: Number(internal), assignment: Number(assignment), examination: Number(examination) };
  for (const [component, maximum] of Object.entries(assessmentMaximums)) {
    if (!Number.isFinite(scores[component]) || scores[component] < 0 || scores[component] > maximum) {
      throw new Error(`${component[0].toUpperCase()}${component.slice(1)} marks must be between 0 and ${maximum}`);
    }
  }
  const total = scores.internal + scores.assignment + scores.examination;
  return { ...scores, total, percentage: total, grade: calculateGrade(total) };
}

export function createStudent(students, input) {
  const student = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, String(value ?? '').trim()]));
  const required = ['studentId', 'rollNumber', 'name', 'email', 'phone', 'department', 'year', 'division', 'dateOfBirth', 'admissionDate'];
  if (required.some(key => !student[key])) throw new Error('Complete all required student fields.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) throw new Error('Enter a valid email address.');
  if (!/^[6-9]\d{9}$/.test(student.phone)) throw new Error('Enter a valid 10-digit Indian mobile number.');
  if (students.some(item => item.studentId.toLowerCase() === student.studentId.toLowerCase())) throw new Error('Student ID already exists.');
  if (students.some(item => item.rollNumber.toLowerCase() === student.rollNumber.toLowerCase())) throw new Error('Roll number already exists.');
  const today = new Date().toISOString().slice(0, 10);
  if (Number.isNaN(Date.parse(student.dateOfBirth)) || student.dateOfBirth > today) throw new Error('Date of birth must be a valid date in the past.');
  if (Number.isNaN(Date.parse(student.admissionDate)) || student.admissionDate > today || student.admissionDate < student.dateOfBirth) {
    throw new Error('Enter a valid admission date that is not in the future.');
  }
  if (!['1', '2', '3', '4'].includes(student.year)) throw new Error('Select a valid year.');
  return [...students, { ...student, id: student.id || `student-${Date.now()}`, year: Number(student.year), status: student.status || 'Active' }];
}

export function updateStudent(students, id, changes) {
  const current = students.find(student => student.id === id);
  if (!current) throw new Error('Student record was not found.');
  const others = students.filter(student => student.id !== id);
  const updated = createStudent(others, { ...current, ...changes, id });
  return students.map(student => student.id === id ? updated[updated.length - 1] : student);
}

export function deleteStudentData(data, studentId) {
  return {
    ...data,
    students: data.students.filter(student => student.id !== studentId),
    enrollments: data.enrollments.filter(enrollment => enrollment.studentId !== studentId),
    attendance: data.attendance.filter(record => record.studentId !== studentId),
    results: data.results.filter(result => result.studentId !== studentId),
  };
}

export function enrollStudent(enrollments, studentId, courseId, students, courses) {
  if (!students.some(student => student.id === studentId && student.status === 'Active')) throw new Error('Select an active student record.');
  if (!courses.some(course => course.id === courseId && course.status === 'Active')) throw new Error('Select an active course.');
  if (enrollments.some(enrollment => enrollment.studentId === studentId && enrollment.courseId === courseId)) {
    throw new Error('This student is already enrolled in the course.');
  }
  return [...enrollments, { id: `enrollment-${studentId}-${courseId}`, studentId, courseId }];
}

export function recordAttendance(records, entry) {
  if (records.some(record => record.studentId === entry.studentId && record.courseId === entry.courseId && record.date === entry.date)) {
    throw new Error('Attendance has already been recorded for this student, course, and date.');
  }
  if (!['Present', 'Absent'].includes(entry.status)) throw new Error('Choose Present or Absent.');
  return [...records, { ...entry, id: entry.id || `attendance-${entry.studentId}-${entry.courseId}-${entry.date}` }];
}

export function saveAttendanceSession(records, courseId, date, entries, enrolledStudentIds) {
  const seen = new Set();
  const enrolled = new Set(enrolledStudentIds);
  for (const entry of entries) {
    if (!enrolled.has(entry.studentId)) throw new Error('Attendance can only be recorded for students enrolled in this course.');
    if (seen.has(entry.studentId)) throw new Error('A student can only appear once in an attendance session.');
    seen.add(entry.studentId);
    if (!['Present', 'Absent'].includes(entry.status)) throw new Error('Choose Present or Absent for every student.');
  }
  const unaffected = records.filter(record => record.courseId !== courseId || record.date !== date);
  return entries.reduce((next, entry) => recordAttendance(next, { ...entry, courseId, date }), unaffected);
}

export function saveResult(results, input, editingId = null) {
  const calculated = calculateMarks(input);
  const duplicate = results.some(result => result.studentId === input.studentId && result.courseId === input.courseId && result.id !== editingId);
  if (duplicate) throw new Error('A result already exists for this student and course. Edit the existing result instead.');
  const record = {
    id: editingId || `result-${input.studentId}-${input.courseId}`,
    studentId: input.studentId,
    courseId: input.courseId,
    ...calculated,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  return editingId ? results.map(result => result.id === editingId ? record : result) : [...results, record];
}

export function calculateDashboardStats(data) {
  const attendanceByEnrollment = data.enrollments.map(enrollment => calculateAttendancePercentage(
    data.attendance.filter(record => record.studentId === enrollment.studentId && record.courseId === enrollment.courseId),
  ));
  const performance = data.results.map(result => calculateMarks(result).percentage);
  const averageAttendance = attendanceByEnrollment.length
    ? Math.round(attendanceByEnrollment.reduce((sum, value) => sum + value, 0) / attendanceByEnrollment.length)
    : 0;
  const averagePerformance = performance.length
    ? Math.round(performance.reduce((sum, value) => sum + value, 0) / performance.length)
    : 0;
  const atRisk = data.students.filter(student => {
    const enrolled = data.enrollments.filter(enrollment => enrollment.studentId === student.id);
    return enrolled.some(enrollment => calculateAttendancePercentage(data.attendance.filter(record => record.studentId === student.id && record.courseId === enrollment.courseId)) < 75)
      || data.results.filter(result => result.studentId === student.id).some(result => calculateMarks(result).percentage < 40);
  });
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const today = new Date().toISOString().slice(0, 10);
  const recentAnnouncementCount = data.announcements.filter(item => item.publishedAt >= weekAgo.toISOString().slice(0, 10) && item.publishedAt <= today).length;
  return {
    totalStudents: data.students.length,
    activeCourses: data.courses.filter(course => course.status === 'Active').length,
    averageAttendance,
    averagePerformance,
    studentsAtRisk: atRisk.length,
    pendingAnnouncements: recentAnnouncementCount,
    atRisk,
  };
}

export function exportCsv(filename, rows) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]);
  const quote = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const content = [columns.map(quote).join(','), ...rows.map(row => columns.map(column => quote(row[column])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function saveCourse(courses, input, editingId = null) {
  const course = {
    code: String(input.code ?? '').trim().toUpperCase(),
    name: String(input.name ?? '').trim(),
    department: String(input.department ?? '').trim(),
    semester: Number(input.semester),
    credits: Number(input.credits),
    faculty: String(input.faculty ?? '').trim(),
    status: String(input.status ?? 'Active'),
  };
  if (!course.code || !course.name || !course.department || !course.faculty) throw new Error('Complete all required course fields.');
  if (!Number.isInteger(course.semester) || course.semester < 1 || course.semester > 8) throw new Error('Semester must be between 1 and 8.');
  if (!Number.isInteger(course.credits) || course.credits < 1 || course.credits > 8) throw new Error('Credits must be between 1 and 8.');
  if (courses.some(item => item.code.toLowerCase() === course.code.toLowerCase() && item.id !== editingId)) throw new Error('Course code already exists.');
  const record = { ...course, id: editingId || `course-${Date.now()}` };
  return editingId ? courses.map(item => item.id === editingId ? record : item) : [...courses, record];
}

export function deleteCourseData(data, courseId) {
  return {
    ...data,
    courses: data.courses.filter(course => course.id !== courseId),
    enrollments: data.enrollments.filter(enrollment => enrollment.courseId !== courseId),
    attendance: data.attendance.filter(record => record.courseId !== courseId),
    results: data.results.filter(result => result.courseId !== courseId),
    timetable: data.timetable.filter(item => item.courseId !== courseId),
  };
}

export function saveTimetableEntry(entries, input, courses, editingId = null) {
  const start = String(input.startTime ?? '');
  const end = String(input.endTime ?? '');
  if (!input.courseId || !input.day || !start || !end || !input.room || !input.division) throw new Error('Complete all timetable fields.');
  if (start >= end) throw new Error('Class end time must be later than its start time.');
  const course = courses.find(item => item.id === input.courseId);
  if (!course) throw new Error('Select a valid course.');
  const conflict = entries.some(item => {
    if (item.id === editingId || item.day !== input.day) return false;
    const overlaps = start < item.endTime && item.startTime < end;
    if (!overlaps) return false;
    const otherCourse = courses.find(courseItem => courseItem.id === item.courseId);
    const sameRoom = item.room.trim().toLowerCase() === input.room.trim().toLowerCase();
    const sameDivision = otherCourse?.department === course.department && item.division === input.division;
    return sameRoom || sameDivision;
  });
  if (conflict) throw new Error('This time overlaps another class in the same room or department division.');
  const record = { ...input, room: input.room.trim(), id: editingId || `class-${Date.now()}` };
  return editingId ? entries.map(item => item.id === editingId ? record : item) : [...entries, record];
}

export function saveAnnouncement(announcements, input, editingId = null) {
  const record = {
    title: String(input.title ?? '').trim(),
    description: String(input.description ?? '').trim(),
    category: String(input.category ?? 'Academic'),
    priority: String(input.priority ?? 'Normal'),
    publishedAt: String(input.publishedAt ?? ''),
    department: String(input.department ?? 'All departments'),
    year: String(input.year ?? 'All years'),
  };
  if (!record.title || !record.description || !record.publishedAt) throw new Error('Complete the title, description, and publication date.');
  if (Number.isNaN(Date.parse(record.publishedAt))) throw new Error('Enter a valid publication date.');
  record.id = editingId || `announcement-${Date.now()}`;
  return editingId ? announcements.map(item => item.id === editingId ? record : item) : [record, ...announcements];
}