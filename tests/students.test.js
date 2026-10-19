import { describe, expect, it } from 'vitest';
import { searchStudents } from '../src/students.js';
import {
	calculateAttendancePercentage,
	calculateDashboardStats,
	calculateGrade,
	calculateMarks,
	createStudent,
	deleteStudentData,
	enrollStudent,
	recordAttendance,
	saveAttendanceSession,
	saveResult,
	saveTimetableEntry,
} from '../src/services/domain.js';
import { loadData } from '../src/services/store.js';

const validStudent = {
	id: 'student-record-31',
	studentId: 'CF-26-031',
	rollNumber: 'IT24-031',
	name: 'Asha Rao',
	email: 'asha.rao@example.edu',
	phone: '9876543210',
	department: 'Information Technology',
	year: '2',
	division: 'A',
	dateOfBirth: '2005-02-10',
	admissionDate: '2024-07-15',
	status: 'Active',
};

describe('student records', () => {
	it('creates a valid student record', () => {
		const students = createStudent([], validStudent);
		expect(students).toHaveLength(1);
		expect(students[0]).toMatchObject({ studentId: 'CF-26-031', year: 2, status: 'Active' });
	});

	it('rejects duplicate student IDs and roll numbers', () => {
		expect(() => createStudent([{ ...validStudent }], { ...validStudent, rollNumber: 'IT24-032' })).toThrow(/Student ID/);
		expect(() => createStudent([{ ...validStudent }], { ...validStudent, studentId: 'CF-26-032' })).toThrow(/Roll number/);
	});

	it('rejects invalid email, phone, and future birth dates', () => {
		expect(() => createStudent([], { ...validStudent, email: 'invalid' })).toThrow(/email/);
		expect(() => createStudent([], { ...validStudent, phone: '1234567890' })).toThrow(/10-digit/);
		expect(() => createStudent([], { ...validStudent, dateOfBirth: '2999-01-01' })).toThrow(/past/);
	});

	it('searches names without case sensitivity', () => {
		const students = [{ name: 'Asha Rao' }, { name: 'Kabir Shah' }];
		expect(searchStudents(students, 'ASHA')).toEqual([students[0]]);
	});

	it('deletes a student and all related academic records', () => {
		const data = {
			students: [{ id: 's1' }, { id: 's2' }],
			enrollments: [{ studentId: 's1' }, { studentId: 's2' }],
			attendance: [{ studentId: 's1' }, { studentId: 's2' }],
			results: [{ studentId: 's1' }, { studentId: 's2' }],
			courses: [],
		};
		const next = deleteStudentData(data, 's1');
		expect(next.students.map(student => student.id)).toEqual(['s2']);
		expect(next.enrollments).toEqual([{ studentId: 's2' }]);
		expect(next.attendance).toEqual([{ studentId: 's2' }]);
		expect(next.results).toEqual([{ studentId: 's2' }]);
	});
});

describe('attendance and academics', () => {
	it('calculates attendance percentage and handles zero sessions', () => {
		expect(calculateAttendancePercentage([{ status: 'Present' }, { status: 'Present' }, { status: 'Absent' }])).toBe(67);
		expect(calculateAttendancePercentage([])).toBe(0);
	});

	it('prevents a duplicate attendance record for a student, course, and date', () => {
		const records = [{ studentId: 's1', courseId: 'c1', date: '2026-10-01', status: 'Present' }];
		expect(() => recordAttendance(records, { studentId: 's1', courseId: 'c1', date: '2026-10-01', status: 'Absent' })).toThrow(/already been recorded/);
	});

	it('replaces a saved session when attendance is edited', () => {
		const records = [{ id: 'old', studentId: 's1', courseId: 'c1', date: '2026-10-01', status: 'Present' }];
		const next = saveAttendanceSession(records, 'c1', '2026-10-01', [{ studentId: 's1', status: 'Absent' }, { studentId: 's2', status: 'Present' }], ['s1', 's2']);
		expect(next).toHaveLength(2);
		expect(next.map(record => record.status)).toEqual(['Absent', 'Present']);
	});

	it('calculates weighted marks and rejects out-of-range scores', () => {
		expect(calculateMarks({ internal: 17, assignment: 18, examination: 49 })).toMatchObject({ total: 84, percentage: 84, grade: 'A' });
		expect(() => calculateMarks({ internal: 21, assignment: 18, examination: 49 })).toThrow(/between 0 and 20/);
		expect(() => calculateMarks({ internal: '', assignment: 18, examination: 49 })).toThrow(/all three/);
	});

	it('maps every grade boundary correctly', () => {
		expect([95, 85, 75, 65, 55, 45, 39].map(calculateGrade)).toEqual(['A+', 'A', 'B+', 'B', 'C', 'D', 'F']);
	});

	it('rejects duplicate course enrollments', () => {
		const existing = [{ studentId: 's1', courseId: 'c1' }];
		const students = [{ id: 's1', status: 'Active' }, { id: 's2', status: 'Active' }];
		const courses = [{ id: 'c1', status: 'Active' }];
		expect(() => enrollStudent(existing, 's1', 'c1', students, courses)).toThrow(/already enrolled/);
		expect(enrollStudent(existing, 's2', 'c1', students, courses)).toHaveLength(2);
	});

	it('prevents duplicate result records for the same student and course', () => {
		const result = { id: 'r1', studentId: 's1', courseId: 'c1', internal: 15, assignment: 16, examination: 45 };
		expect(() => saveResult([result], { ...result })).toThrow(/already exists/);
		expect(saveResult([result], { ...result, examination: 50 }, 'r1')).toHaveLength(1);
	});

	it('blocks timetable overlaps in a classroom or division', () => {
		const courses = [{ id: 'c1', department: 'Computer Science' }, { id: 'c2', department: 'Computer Science' }];
		const entries = [{ id: 't1', day: 'Monday', startTime: '09:00', endTime: '10:00', courseId: 'c1', room: 'A-204', division: 'A' }];
		expect(() => saveTimetableEntry(entries, { day: 'Monday', startTime: '09:30', endTime: '10:30', courseId: 'c2', room: 'B-110', division: 'A' }, courses)).toThrow(/overlaps/);
	});
});

it('seeds 30 fictional students once and preserves LocalStorage edits', () => {
	const data = loadData();
	expect(data.students).toHaveLength(30);
	data.students[0].name = 'Edited Demo Name';
	localStorage.setItem('campusflow-data-v1', JSON.stringify(data));
	expect(loadData().students[0].name).toBe('Edited Demo Name');
});

it('calculates dashboard summaries from stored records', () => {
	const data = {
		students: [{ id: 's1', status: 'Active' }],
		courses: [{ id: 'c1', status: 'Active' }],
		enrollments: [{ studentId: 's1', courseId: 'c1' }],
		attendance: [{ studentId: 's1', courseId: 'c1', status: 'Present' }, { studentId: 's1', courseId: 'c1', status: 'Absent' }],
		results: [{ studentId: 's1', courseId: 'c1', internal: 5, assignment: 10, examination: 20 }],
		announcements: [{ publishedAt: new Date().toISOString().slice(0, 10) }],
	};
	expect(calculateDashboardStats(data)).toMatchObject({ totalStudents: 1, activeCourses: 1, averageAttendance: 50, averagePerformance: 35, studentsAtRisk: 1, pendingAnnouncements: 1 });
});
