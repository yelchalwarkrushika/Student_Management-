import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GraduationCap, Pencil, Plus } from 'lucide-react';
import { useCampusData } from '../services/useCampusData.js';
import { calculateMarks, saveResult } from '../services/domain.js';
import { Badge, Button, EmptyState, Field, InlineNotice, Modal, PageTitle, Panel, SelectField } from '../components/ui.jsx';

const blankResult = { studentId: '', courseId: '', internal: '', assignment: '', examination: '' };

export function AcademicsPage({ session }) {
  const { data, updateData } = useCampusData();
  const [searchParams, setSearchParams] = useSearchParams();
  const addAction = searchParams.get('action') === 'add' && session.role !== 'Student';
  const firstEnrollment = data.enrollments[0];
  const [studentFilter, setStudentFilter] = useState(session.role === 'Student' ? session.studentId : 'all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [editor, setEditor] = useState(() => addAction ? { ...blankResult, studentId: firstEnrollment?.studentId || '', courseId: firstEnrollment?.courseId || '' } : null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const selectableStudents = data.students.filter(student => session.role !== 'Student' || student.id === session.studentId);

  useEffect(() => {
    if (addAction) setSearchParams({}, { replace: true });
  }, [addAction, setSearchParams]);

  const results = data.results.filter(result => (studentFilter === 'all' || result.studentId === studentFilter)
    && (courseFilter === 'all' || result.courseId === courseFilter)
    && (session.role !== 'Student' || result.studentId === session.studentId));

  function openNewResult() {
    const first = data.enrollments.find(item => session.role !== 'Student' || item.studentId === session.studentId);
    setEditor({ ...blankResult, studentId: first?.studentId || '', courseId: first?.courseId || '' });
    setError('');
  }

  function submitResult(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    const isEnrolled = data.enrollments.some(item => item.studentId === form.studentId && item.courseId === form.courseId);
    if (!isEnrolled) { setError('Select a course in which this student is enrolled.'); return; }
    try {
      updateData({ ...data, results: saveResult(data.results, form, editor.editingId) });
      setNotice('Academic result saved.');
      setEditor(null);
      setError('');
    } catch (saveError) { setError(saveError.message); }
  }

  return <>
    <PageTitle eyebrow="ASSESSMENT RECORDS" title="Academics" detail="Review subject results using the published 20 / 20 / 60 weighted assessment scheme." actions={session.role !== 'Student' && <Button onClick={openNewResult}><Plus size={16} /> Add marks</Button>} />
    <InlineNotice>{notice}</InlineNotice><InlineNotice tone="error">{error}</InlineNotice>
    <div className="grading-callout"><span><GraduationCap size={20} /></span><div><strong>Grading scheme</strong><p>Internal assessment / 20 + assignment / 20 + examination / 60 = total / 100. Grades: A+ 90–100 · A 80–89 · B+ 70–79 · B 60–69 · C 50–59 · D 40–49 · F below 40.</p></div></div>
    <Panel className="table-panel"><div className="toolbar"><SelectField label="Student" value={studentFilter} onChange={event => setStudentFilter(event.target.value)} options={session.role === 'Student' ? selectableStudents.map(student => ({ value: student.id, label: `${student.name} · ${student.rollNumber}` })) : [{ value: 'all', label: 'All students' }, ...selectableStudents.map(student => ({ value: student.id, label: `${student.name} · ${student.rollNumber}` }))]} /><SelectField label="Course" value={courseFilter} onChange={event => setCourseFilter(event.target.value)} options={[{ value: 'all', label: 'All courses' }, ...data.courses.map(course => ({ value: course.id, label: `${course.code} · ${course.name}` }))]} /></div>
      {results.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Student</th><th>Course</th><th>Internal / 20</th><th>Assignment / 20</th><th>Exam / 60</th><th>Total</th><th>Grade</th>{session.role !== 'Student' && <th>Action</th>}</tr></thead><tbody>{results.map(result => {
        const student = data.students.find(item => item.id === result.studentId);
        const course = data.courses.find(item => item.id === result.courseId);
        const marks = calculateMarks(result);
        return <tr key={result.id}><td><div className="table-primary">{student?.name || 'Unknown student'}</div><small className="cell-subtle">{student?.rollNumber}</small></td><td><div className="table-primary">{course?.code}</div><small className="cell-subtle">{course?.name}</small></td><td>{marks.internal}</td><td>{marks.assignment}</td><td>{marks.examination}</td><td><strong>{marks.total}%</strong></td><td><Badge tone={marks.grade === 'F' ? 'red' : marks.grade.startsWith('A') ? 'green' : 'blue'}>{marks.grade}</Badge></td>{session.role !== 'Student' && <td><button className="table-action" aria-label={`Edit marks for ${student?.name}`} onClick={() => { setEditor({ ...result, editingId: result.id }); setError(''); }}><Pencil size={16} /> Edit</button></td>}</tr>;
      })}</tbody></table></div> : <EmptyState title="No results in this view" detail={session.role === 'Student' ? 'Your results will appear here after assessment records are published.' : 'Add an assessment result for an enrolled student and course.'} action={session.role !== 'Student' && <Button onClick={openNewResult}><Plus size={16} /> Add marks</Button>} />}
      <footer className="table-footer"><span>{results.length} result records</span><span>Scores are persisted in this browser demo.</span></footer>
    </Panel>

    {editor && <Modal title={editor.editingId ? 'Edit academic result' : 'Record academic marks'} description="Only students enrolled in the selected course can receive marks." onClose={() => { setEditor(null); setError(''); }}>
      <form className="form-grid one-column" onSubmit={submitResult}>
        <SelectField label="Student" name="studentId" value={editor.studentId} onChange={event => setEditor(current => ({ ...current, studentId: event.target.value }))} options={selectableStudents.filter(student => data.enrollments.some(item => item.studentId === student.id)).map(student => ({ value: student.id, label: `${student.name} · ${student.rollNumber}` }))} />
        <SelectField label="Course" name="courseId" value={editor.courseId} onChange={event => setEditor(current => ({ ...current, courseId: event.target.value }))} options={data.courses.filter(course => data.enrollments.some(item => item.studentId === editor.studentId && item.courseId === course.id)).map(course => ({ value: course.id, label: `${course.code} · ${course.name}` }))} />
        <div className="score-row"><Field label="Internal / 20" name="internal" type="number" min="0" max="20" step="0.5" defaultValue={editor.internal} required /><Field label="Assignment / 20" name="assignment" type="number" min="0" max="20" step="0.5" defaultValue={editor.assignment} required /><Field label="Examination / 60" name="examination" type="number" min="0" max="60" step="0.5" defaultValue={editor.examination} required /></div>
        {error && <InlineNotice tone="error">{error}</InlineNotice>}
        <div className="modal-actions"><Button type="button" variant="secondary" onClick={() => setEditor(null)}>Cancel</Button><Button type="submit">Save result</Button></div>
      </form>
    </Modal>}
  </>;
}