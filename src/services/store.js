const STORAGE_KEY = 'campusflow-data-v1';

const studentNames = [
  'Aarav Mehta', 'Ananya Rao', 'Rohan Iyer', 'Ishita Nair', 'Kabir Shah',
  'Diya Menon', 'Vihaan Kulkarni', 'Saanvi Patel', 'Aditya Reddy', 'Myra Das',
  'Arjun Kapoor', 'Kiara Joshi', 'Reyansh Bhat', 'Aadhya Bose', 'Ishaan Pillai',
  'Sara Khan', 'Dev Malhotra', 'Avni Sethi', 'Neil Fernandes', 'Tara Chawla',
  'Yash Verma', 'Mira Krishnan', 'Kian Dutta', 'Riya Shetty', 'Om Prakash',
  'Nisha Thomas', 'Dhruv Jain', 'Zoya Merchant', 'Parth Ghosh', 'Aanya Roy',
];

const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Business Analytics'];
const departmentCourses = {
  'Computer Science': ['CS-201', 'CS-202', 'BA-210'],
  'Information Technology': ['IT-301', 'IT-302', 'CS-202'],
  Electronics: ['EC-202', 'CS-201'],
  'Business Analytics': ['BA-210', 'IT-301'],
};

const courseSeeds = [
  { code: 'CS-201', name: 'Algorithms & Data Structures', department: 'Computer Science', semester: 3, credits: 4, faculty: 'Dr. Neha Iyer' },
  { code: 'CS-202', name: 'Database Systems', department: 'Computer Science', semester: 4, credits: 4, faculty: 'Prof. Kabir Nair' },
  { code: 'IT-301', name: 'Cloud Computing', department: 'Information Technology', semester: 5, credits: 3, faculty: 'Dr. Aditi Rao' },
  { code: 'IT-302', name: 'Cybersecurity Fundamentals', department: 'Information Technology', semester: 5, credits: 3, faculty: 'Prof. Sameer Shah' },
  { code: 'EC-202', name: 'Signals & Embedded Systems', department: 'Electronics', semester: 4, credits: 4, faculty: 'Dr. Priya Menon' },
  { code: 'BA-210', name: 'Business Data Analytics', department: 'Business Analytics', semester: 3, credits: 3, faculty: 'Prof. Rohan Das' },
];

function relativeDate(daysAgo) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function createSeedData() {
  const courses = courseSeeds.map((course, index) => ({
    ...course,
    id: `course-${index + 1}`,
    status: 'Active',
  }));
  const students = studentNames.map((name, index) => {
    const department = departments[Math.floor(index / 8)];
    const year = (index % 4) + 1;
    const birthday = new Date(2003 + (index % 4), index % 12, (index % 26) + 1);
    return {
      id: `student-${String(index + 1).padStart(3, '0')}`,
      studentId: `CF-26-${String(index + 1).padStart(3, '0')}`,
      rollNumber: `CF26${String(index + 1).padStart(3, '0')}`,
      name,
      email: `${name.toLowerCase().replaceAll(' ', '.')}@students.campusflow.edu`,
      phone: `9${String(100000000 + index * 7919).slice(0, 9)}`,
      department,
      year,
      division: index % 2 === 0 ? 'A' : 'B',
      dateOfBirth: birthday.toISOString().slice(0, 10),
      admissionDate: `${2026 - year}-07-15`,
      status: index === 16 ? 'On leave' : 'Active',
    };
  });
  const enrollments = students.flatMap((student, index) => departmentCourses[student.department].slice(0, index % 3 === 0 ? 3 : 2).map((code, courseIndex) => ({
    id: `enrollment-${student.id}-${code}`,
    studentId: student.id,
    courseId: courses.find(course => course.code === code).id,
    enrolledAt: relativeDate((index * 3 + courseIndex) % 21),
  })));
  const attendance = enrollments.flatMap((enrollment, enrollmentIndex) => Array.from({ length: 8 }, (_, sessionIndex) => ({
    id: `attendance-${enrollment.id}-${sessionIndex + 1}`,
    studentId: enrollment.studentId,
    courseId: enrollment.courseId,
    date: relativeDate((7 - sessionIndex) * 7),
    status: enrollmentIndex % 17 === 0
      ? (sessionIndex < 3 ? 'Absent' : 'Present')
      : (enrollmentIndex + sessionIndex * 2) % 7 === 0 ? 'Absent' : 'Present',
  })));
  const results = enrollments.filter((_, index) => index % 2 === 0).map((enrollment, index) => ({
    id: `result-${enrollment.studentId}-${enrollment.courseId}`,
    studentId: enrollment.studentId,
    courseId: enrollment.courseId,
    internal: index % 11 === 0 ? 5 : 12 + (index * 3) % 9,
    assignment: index % 11 === 0 ? 5 : 13 + (index * 5) % 8,
    examination: index % 11 === 0 ? 20 : 34 + (index * 7) % 26,
    updatedAt: relativeDate(index % 18),
  }));
  const timetable = [
    { id: 'class-1', day: 'Monday', startTime: '09:00', endTime: '10:00', courseId: 'course-1', room: 'A-204', division: 'A' },
    { id: 'class-2', day: 'Monday', startTime: '11:00', endTime: '12:00', courseId: 'course-3', room: 'B-110', division: 'B' },
    { id: 'class-3', day: 'Tuesday', startTime: '10:00', endTime: '11:00', courseId: 'course-2', room: 'A-204', division: 'A' },
    { id: 'class-4', day: 'Wednesday', startTime: '13:00', endTime: '14:00', courseId: 'course-5', room: 'E-105', division: 'A' },
    { id: 'class-5', day: 'Thursday', startTime: '09:00', endTime: '10:00', courseId: 'course-4', room: 'B-110', division: 'B' },
    { id: 'class-6', day: 'Friday', startTime: '11:00', endTime: '12:00', courseId: 'course-6', room: 'C-302', division: 'A' },
  ];
  const announcements = [
    { id: 'announcement-1', title: 'Mid-semester assessment schedule', description: 'Assessment windows and room allocations are available for review.', category: 'Academic', priority: 'High', publishedAt: relativeDate(1), department: 'All departments', year: 'All years' },
    { id: 'announcement-2', title: 'Library hours extended', description: 'The central library will remain open until 10:00 PM during assessment week.', category: 'Campus', priority: 'Normal', publishedAt: relativeDate(3), department: 'All departments', year: 'All years' },
    { id: 'announcement-3', title: 'Cloud lab registration', description: 'Register with your course faculty before the Friday practical session.', category: 'Course', priority: 'Normal', publishedAt: relativeDate(5), department: 'Information Technology', year: 'Year 3' },
    { id: 'announcement-4', title: 'Academic advising appointments', description: 'Year coordinators have opened appointments for progress reviews.', category: 'Academic', priority: 'High', publishedAt: relativeDate(8), department: 'All departments', year: 'All years' },
    { id: 'announcement-5', title: 'Student research showcase', description: 'Project abstracts are invited for the annual campus showcase.', category: 'Event', priority: 'Normal', publishedAt: relativeDate(12), department: 'All departments', year: 'All years' },
  ];
  return {
    students,
    courses,
    enrollments,
    attendance,
    results,
    timetable,
    announcements,
    calendar: [
      { id: 'calendar-1', title: 'Internal assessment week', date: relativeDate(-9), type: 'Assessment' },
      { id: 'calendar-2', title: 'Project review submissions', date: relativeDate(-16), type: 'Academic' },
      { id: 'calendar-3', title: 'Campus research showcase', date: relativeDate(-24), type: 'Event' },
    ],
  };
}

export function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.courses)) {
        const seeded = createSeedData();
        const recovered = Object.fromEntries(Object.entries(seeded).map(([key, value]) => [key, Array.isArray(parsed[key]) ? parsed[key] : value]));
        recovered.students = recovered.students.map((student, index) => ({
          ...student,
          id: student.id || `student-${index + 1}`,
          studentId: student.studentId || `CF-26-${String(index + 1).padStart(3, '0')}`,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recovered));
        return recovered;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const seeded = createSeedData();
  try {
    const legacyStudents = JSON.parse(localStorage.getItem('fa2-students') || '[]');
    if (Array.isArray(legacyStudents)) {
      legacyStudents.forEach((student, index) => {
        if (!student?.name || !student?.roll || seeded.students.some(item => item.rollNumber === student.roll)) return;
        const id = `legacy-${index + 1}`;
        const course = seeded.courses.find(item => item.code === student.course || item.name === student.course) || seeded.courses[0];
        seeded.students.push({
          id,
          studentId: `CF-LEGACY-${String(index + 1).padStart(3, '0')}`,
          rollNumber: student.roll,
          name: student.name,
          email: `legacy.${index + 1}@students.campusflow.edu`,
          phone: '9000000000',
          department: course.department,
          year: 1,
          division: 'A',
          dateOfBirth: '2005-01-01',
          admissionDate: relativeDate(30),
          status: 'Active',
        });
        seeded.enrollments.push({ id: `legacy-enrollment-${index + 1}`, studentId: id, courseId: course.id, enrolledAt: relativeDate(30) });
      });
    }
  } catch {
    localStorage.removeItem('fa2-students');
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData() {
  const data = createSeedData();
  saveData(data);
  return data;
}