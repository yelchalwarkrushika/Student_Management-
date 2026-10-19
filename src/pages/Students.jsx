import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCampusData } from '../services/useCampusData.js';
import { createStudent, deleteStudentData, exportCsv, updateStudent, calculateAttendancePercentage } from '../services/domain.js';
import { searchStudents } from '../students.js';
import { Badge, Button, EmptyState, Field, InlineNotice, Modal, PageTitle, Panel, SelectField } from '../components/ui.jsx';

const pageSize = 8;
const emptyStudent = { studentId: '', rollNumber: '', name: '', email: '', phone: '', department: 'Computer Science', year: '1', division: 'A', dateOfBirth: '', admissionDate: '', status: 'Active' };

export function StudentsPage() {
  const { data, updateData } = useCampusData();
  const [searchParams, setSearchParams] = useSearchParams();
  const addAction = searchParams.get('action') === 'add';
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [department, setDepartment] = useState('All departments');
  const [year, setYear] = useState('All years');
  const [status, setStatus] = useState('All statuses');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState(() => addAction ? emptyStudent : null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (addAction) setSearchParams({}, { replace: true });
  }, [addAction, setSearchParams]);

  const filtered = useMemo(() => searchStudents(data.students, query).filter(student => {
    return (department === 'All departments' || student.department === department)
      && (year === 'All years' || student.year === Number(year))
      && (status === 'All statuses' || student.status === status);
  }).sort((a, b) => sort === 'roll' ? a.rollNumber.localeCompare(b.rollNumber) : a.name.localeCompare(b.name)), [data.students, query, department, year, status, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const closeEditor = () => { setEditor(null); setError(''); };

  function saveStudent(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const students = editor.editingId
        ? updateStudent(data.students, editor.editingId, values)
        : createStudent(data.students, values);
      updateData({ ...data, students });
      setNotice(editor.editingId ? 'Student record updated.' : 'Student added to the roster.');
      closeEditor();
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  function removeStudent() {
    updateData(deleteStudentData(data, deleting.id));
    setDeleting(null);
    setViewing(null);
    setNotice('Student and related attendance, result, and enrollment records were removed.');
  }

  return <>
    <PageTitle eyebrow="PEOPLE & RECORDS" title="Students" detail="Manage student profiles, enrollment status, and academic identity." actions={<>
      <Button variant="secondary" onClick={() => exportCsv('campusflow-students.csv', filtered.map(({ studentId, rollNumber, name, email, phone, department: program, year: studyYear, division, admissionDate, status: enrollmentStatus }) => ({ studentId, rollNumber, name, email, phone, department: program, year: studyYear, division, admissionDate, status: enrollmentStatus })))}><Download size={16} /> Export CSV</Button>
      <Button onClick={() => { setEditor(emptyStudent); setError(''); }}><Plus size={16} /> Add student</Button>
    </>} />
    <InlineNotice>{notice}</InlineNotice>
    <Panel className="table-panel">
      <div className="toolbar">
        <label className="search-field"><Search size={17} /><input aria-label="Search students" placeholder="Search name, ID or roll number" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></label>
        <SelectField label="Department" value={department} onChange={event => { setDepartment(event.target.value); setPage(1); }} options={['All departments', ...new Set(data.students.map(student => student.department))]} />
        <SelectField label="Year" value={year} onChange={event => { setYear(event.target.value); setPage(1); }} options={['All years', '1', '2', '3', '4']} />
        <SelectField label="Status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} options={['All statuses', 'Active', 'On leave', 'Graduated']} />
        <SelectField label="Sort" value={sort} onChange={event => setSort(event.target.value)} options={[{ value: 'name', label: 'Name A–Z' }, { value: 'roll', label: 'Roll number' }]} />
      </div>
      {pageRows.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Student</th><th>Student ID / roll number</th><th>Department</th><th>Year / division</th><th>Status</th><th className="actions-column">Actions</th></tr></thead><tbody>
        {pageRows.map(student => <tr key={student.id}><td><div className="student-cell"><span className="initial-avatar">{student.name.split(' ').map(part => part[0]).join('').slice(0, 2)}</span><span><strong>{student.name}</strong><small>{student.email}</small></span></div></td><td><span className="mono-label">{student.studentId}</span><small className="cell-subtle">{student.rollNumber}</small></td><td>{student.department}</td><td>Year {student.year} <span className="muted">·</span> {student.division}</td><td><Badge tone={student.status === 'Active' ? 'green' : student.status === 'On leave' ? 'orange' : 'neutral'}>{student.status}</Badge></td><td><div className="row-actions"><button aria-label={`View ${student.name}`} title="View profile" onClick={() => setViewing(student)}><Eye size={16} /></button><button aria-label={`Edit ${student.name}`} title="Edit student" onClick={() => { setEditor({ ...student, editingId: student.id }); setError(''); }}><Pencil size={15} /></button><button aria-label={`Delete ${student.name}`} title="Delete student" onClick={() => setDeleting(student)}><Trash2 size={15} /></button></div></td></tr>)}
      </tbody></table></div> : <EmptyState title="No students found" detail="Try changing your search or filters, or add a new student record." action={<Button onClick={() => setEditor(emptyStudent)}><Plus size={16} /> Add student</Button>} />}
      <footer className="table-footer"><span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} students</span><div><button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage(value => value + 1)}>Next</button></div></footer>
    </Panel>

    {editor && <Modal title={editor.editingId ? 'Edit student' : 'Add student'} description="Student identity and enrollment details are stored in this browser." onClose={closeEditor} wide>
      <form className="form-grid" onSubmit={saveStudent}>
        <Field label="Student ID" name="studentId" defaultValue={editor.studentId} required placeholder="CF-26-031" />
        <Field label="Roll number" name="rollNumber" defaultValue={editor.rollNumber} required placeholder="IT24-031" />
        <Field label="Full name" name="name" defaultValue={editor.name} required placeholder="Full legal name" />
        <Field label="Email address" name="email" type="email" defaultValue={editor.email} required placeholder="name@students.edu" />
        <Field label="Phone number" name="phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} defaultValue={editor.phone} required placeholder="10-digit Indian mobile" />
        <SelectField label="Department" name="department" defaultValue={editor.department || 'Computer Science'} options={['Computer Science', 'Information Technology', 'Electronics', 'Business Analytics']} />
        <SelectField label="Year" name="year" defaultValue={String(editor.year || '1')} options={['1', '2', '3', '4']} />
        <SelectField label="Division" name="division" defaultValue={editor.division || 'A'} options={['A', 'B', 'C']} />
        <Field label="Date of birth" name="dateOfBirth" type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={editor.dateOfBirth} required />
        <Field label="Admission date" name="admissionDate" type="date" max={new Date().toISOString().slice(0, 10)} defaultValue={editor.admissionDate} required />
        <SelectField label="Enrollment status" name="status" defaultValue={editor.status || 'Active'} options={['Active', 'On leave', 'Graduated']} />
        {error && <InlineNotice tone="error">{error}</InlineNotice>}
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={closeEditor}>Cancel</Button><Button type="submit">{editor.editingId ? 'Save changes' : 'Create student'}</Button></div>
      </form>
    </Modal>}

    {viewing && <Modal title="Student profile" description={`${viewing.studentId} · ${viewing.rollNumber}`} onClose={() => setViewing(null)}>
      <div className="profile-overview"><span className="profile-avatar">{viewing.name.split(' ').map(part => part[0]).join('').slice(0, 2)}</span><div><h3>{viewing.name}</h3><p>{viewing.department} · Year {viewing.year}, Division {viewing.division}</p></div><Badge tone={viewing.status === 'Active' ? 'green' : 'orange'}>{viewing.status}</Badge></div>
      <dl className="detail-grid"><div><dt>Email</dt><dd>{viewing.email}</dd></div><div><dt>Phone</dt><dd>{viewing.phone}</dd></div><div><dt>Date of birth</dt><dd>{viewing.dateOfBirth}</dd></div><div><dt>Admission date</dt><dd>{viewing.admissionDate}</dd></div><div><dt>Attendance</dt><dd>{calculateAttendancePercentage(data.attendance.filter(row => row.studentId === viewing.id))}%</dd></div><div><dt>Courses</dt><dd>{data.enrollments.filter(row => row.studentId === viewing.id).length} active enrollments</dd></div></dl>
      <div className="modal-actions"><Button variant="secondary" onClick={() => setViewing(null)}>Close</Button><Button onClick={() => { setEditor({ ...viewing, editingId: viewing.id }); setViewing(null); }}>Edit profile</Button></div>
    </Modal>}

    {deleting && <Modal title="Delete student record?" description="This action cannot be undone." onClose={() => setDeleting(null)}>
      <div className="confirm-copy"><span className="confirm-icon"><Trash2 size={20} /></span><p>Deleting <strong>{deleting.name}</strong> also removes their course enrollments, attendance history, and academic results from this demo dataset.</p></div>
      <div className="modal-actions"><Button variant="secondary" onClick={() => setDeleting(null)}>Keep record</Button><Button variant="danger" onClick={removeStudent}>Delete student</Button></div>
    </Modal>}
  </>;
}