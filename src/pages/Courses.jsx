import { useMemo, useState } from 'react';
import { BookOpen, Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import { useCampusData } from '../services/useCampusData.js';
import { deleteCourseData, enrollStudent, saveCourse } from '../services/domain.js';
import { Badge, Button, EmptyState, Field, InlineNotice, Modal, PageTitle, Panel, SelectField } from '../components/ui.jsx';

const emptyCourse = { code: '', name: '', department: 'Computer Science', semester: '1', credits: '3', faculty: '', status: 'Active' };

export function CoursesPage({ session }) {
  const { data, updateData } = useCampusData();
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [enrolling, setEnrolling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const courses = data.courses.filter(course => (session.role !== 'Student' || data.enrollments.some(item => item.studentId === session.studentId && item.courseId === course.id))
    && `${course.code} ${course.name} ${course.department} ${course.faculty}`.toLowerCase().includes(query.toLowerCase()));
  const eligibleStudents = useMemo(() => data.students.filter(student => student.status === 'Active' && !data.enrollments.some(enrollment => enrollment.studentId === student.id && enrollment.courseId === enrolling?.id)), [data.students, data.enrollments, enrolling?.id]);

  function save(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      updateData({ ...data, courses: saveCourse(data.courses, form, editor.editingId) });
      setNotice(editor.editingId ? 'Course details updated.' : 'Course created.');
      setEditor(null);
      setError('');
    } catch (saveError) { setError(saveError.message); }
  }

  function addEnrollment(event) {
    event.preventDefault();
    const studentId = new FormData(event.currentTarget).get('studentId');
    try {
      updateData({ ...data, enrollments: enrollStudent(data.enrollments, studentId, enrolling.id, data.students, data.courses) });
      setNotice('Student enrolled in the course.');
      setEnrolling(null);
      setError('');
    } catch (enrollmentError) { setError(enrollmentError.message); }
  }

  const courseCount = data.enrollments.reduce((counts, enrollment) => ({ ...counts, [enrollment.courseId]: (counts[enrollment.courseId] || 0) + 1 }), {});

  return <>
    <PageTitle eyebrow="CURRICULUM & DELIVERY" title="Courses" detail="Maintain course catalog details and connect students to the classes they take." actions={session.role !== 'Student' && <Button onClick={() => { setEditor(emptyCourse); setError(''); }}><Plus size={16} /> Add course</Button>} />
    <InlineNotice>{notice}</InlineNotice><InlineNotice tone="error">{error}</InlineNotice>
    <Panel className="table-panel"><div className="toolbar"><label className="search-field"><BookOpen size={17} /><input aria-label="Search courses" placeholder="Search courses, departments or faculty" value={query} onChange={event => setQuery(event.target.value)} /></label><span className="toolbar-count">{courses.length} courses · {session.role === 'Student' ? 'your enrollments' : `${data.enrollments.length} enrollments`}</span></div>
      {courses.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Course</th><th>Department</th><th>Semester</th><th>Faculty</th><th>Credits</th><th>Students</th><th>Status</th>{session.role !== 'Student' && <th>Actions</th>}</tr></thead><tbody>{courses.map(course => <tr key={course.id}><td><div className="course-code">{course.code}</div><small className="cell-subtle">{course.name}</small></td><td>{course.department}</td><td>{course.semester}</td><td>{course.faculty}</td><td>{course.credits}</td><td><span className="enrollment-count">{courseCount[course.id] || 0}</span></td><td><Badge tone={course.status === 'Active' ? 'green' : 'neutral'}>{course.status}</Badge></td>{session.role !== 'Student' && <td><div className="row-actions"><button title="Enroll student" aria-label={`Enroll student in ${course.code}`} onClick={() => { setEnrolling(course); setError(''); }}><UserPlus size={16} /></button><button title="Edit course" aria-label={`Edit ${course.code}`} onClick={() => { setEditor({ ...course, editingId: course.id }); setError(''); }}><Pencil size={15} /></button><button title="Delete course" aria-label={`Delete ${course.code}`} onClick={() => setDeleting(course)}><Trash2 size={15} /></button></div></td>}</tr>)}</tbody></table></div> : <EmptyState title="No courses match this view" detail="Adjust your search or add courses to the catalog." action={session.role !== 'Student' && <Button onClick={() => setEditor(emptyCourse)}><Plus size={16} /> Add course</Button>} />}
    </Panel>

    {editor && <Modal title={editor.editingId ? 'Edit course' : 'Create course'} description="Course codes must be unique across the catalog." onClose={() => setEditor(null)}>
      <form className="form-grid one-column" onSubmit={save}>
        <Field label="Course code" name="code" defaultValue={editor.code} required placeholder="CS-401" />
        <Field label="Course name" name="name" defaultValue={editor.name} required placeholder="Distributed Systems" />
        <SelectField label="Department" name="department" defaultValue={editor.department || 'Computer Science'} options={['Computer Science', 'Information Technology', 'Electronics', 'Business Analytics']} />
        <div className="score-row"><Field label="Semester" name="semester" type="number" min="1" max="8" defaultValue={editor.semester} required /><Field label="Credits" name="credits" type="number" min="1" max="8" defaultValue={editor.credits} required /></div>
        <Field label="Faculty name" name="faculty" defaultValue={editor.faculty} required placeholder="Dr. Faculty Name" />
        <SelectField label="Course status" name="status" defaultValue={editor.status || 'Active'} options={['Active', 'Archived']} />
        {error && <InlineNotice tone="error">{error}</InlineNotice>}
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={() => setEditor(null)}>Cancel</Button><Button type="submit">Save course</Button></div>
      </form>
    </Modal>}

    {enrolling && <Modal title={`Enroll in ${enrolling.code}`} description={`${enrolling.name} · ${courseCount[enrolling.id] || 0} current enrollments`} onClose={() => setEnrolling(null)}>
      <form className="form-grid one-column" onSubmit={addEnrollment}><SelectField label="Active student" name="studentId" options={eligibleStudents.map(student => ({ value: student.id, label: `${student.name} · ${student.rollNumber}` }))} />{error && <InlineNotice tone="error">{error}</InlineNotice>}<div className="modal-actions"><Button type="button" variant="secondary" onClick={() => setEnrolling(null)}>Cancel</Button><Button type="submit"><UserPlus size={16} /> Enroll student</Button></div></form>
    </Modal>}

    {deleting && <Modal title="Delete course?" description="Course deletion removes all linked teaching records." onClose={() => setDeleting(null)}><div className="confirm-copy"><span className="confirm-icon"><Trash2 size={20} /></span><p>Deleting <strong>{deleting.code} · {deleting.name}</strong> removes {courseCount[deleting.id] || 0} enrollments, attendance, marks, and timetable entries associated with this course.</p></div><div className="modal-actions"><Button variant="secondary" onClick={() => setDeleting(null)}>Keep course</Button><Button variant="danger" onClick={() => { updateData(deleteCourseData(data, deleting.id)); setDeleting(null); setNotice('Course and linked records removed.'); }}>Delete course</Button></div></Modal>}
  </>;
}