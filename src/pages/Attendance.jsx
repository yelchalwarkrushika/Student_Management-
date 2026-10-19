import { useMemo, useState } from 'react';
import { useCampusData } from '../services/useCampusData.js';
import { calculateAttendancePercentage, saveAttendanceSession } from '../services/domain.js';
import { Badge, Button, InlineNotice, PageTitle, Panel, PanelHeading, SelectField } from '../components/ui.jsx';
import { CalendarCheck2, Check, CircleAlert, Users } from 'lucide-react';

export function AttendancePage({ session }) {
  const { data, updateData } = useCampusData();
  const selectableCourses = data.courses.filter(course => session.role !== 'Student' || data.enrollments.some(enrollment => enrollment.studentId === session.studentId && enrollment.courseId === course.id));
  const [courseId, setCourseId] = useState(() => selectableCourses[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [filter, setFilter] = useState('all');
  const sessionKey = `${courseId}|${date}`;
  const [draftState, setDraftState] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const course = data.courses.find(item => item.id === courseId);

  const students = useMemo(() => {
    const enrolledIds = new Set(data.enrollments.filter(enrollment => enrollment.courseId === courseId).map(enrollment => enrollment.studentId));
    return data.students.filter(student => enrolledIds.has(student.id) && (session.role !== 'Student' || student.id === session.studentId));
  }, [data.students, data.enrollments, courseId, session]);
  const sessionRecords = data.attendance.filter(record => record.courseId === courseId && record.date === date);
  const history = [...data.attendance.filter(record => record.courseId === courseId && (session.role !== 'Student' || record.studentId === session.studentId))
    .reduce((groups, record) => groups.set(record.date, [...(groups.get(record.date) || []), record]), new Map())]
    .map(([sessionDate, records]) => ({ date: sessionDate, records, rate: calculateAttendancePercentage(records) }))
    .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  const existing = Object.fromEntries(data.attendance.filter(record => record.courseId === courseId && record.date === date).map(record => [record.studentId, record.status]));
  const initialDraft = Object.fromEntries(students.map(student => [student.id, existing[student.id] || (session.role === 'Student' ? 'Not recorded' : 'Present')]));
  const draft = draftState?.sessionKey === sessionKey ? draftState.value : initialDraft;

  function changeDraft(updater) {
    setDraftState(current => {
      const currentDraft = current?.sessionKey === sessionKey ? current.value : initialDraft;
      return { sessionKey, value: typeof updater === 'function' ? updater(currentDraft) : updater };
    });
  }

  const rates = students.map(student => ({ student, rate: calculateAttendancePercentage(data.attendance.filter(record => record.studentId === student.id && record.courseId === courseId)) }));
  const visible = rates.filter(({ student, rate }) => filter === 'all' || (filter === 'risk' ? rate < 75 : student.name.toLowerCase().includes(filter.toLowerCase()) || student.rollNumber.toLowerCase().includes(filter.toLowerCase())));
  const presentCount = Object.values(draft).filter(status => status === 'Present').length;
  const average = rates.length ? Math.round(rates.reduce((sum, item) => sum + item.rate, 0) / rates.length) : 0;
  const belowThreshold = rates.filter(item => item.rate < 75).length;

  function saveSession() {
    try {
      const entries = students.map(student => ({ studentId: student.id, status: draft[student.id] }));
      updateData({ ...data, attendance: saveAttendanceSession(data.attendance, courseId, date, entries, students.map(student => student.id)) });
      setNotice(`Attendance saved for ${students.length} students on ${date}.`);
      setError('');
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return <>
    <PageTitle eyebrow="CLASS ENGAGEMENT" title="Attendance" detail="Record course sessions and monitor participation against the 75% threshold." actions={session.role === 'Student' ? null : <Button onClick={saveSession} disabled={!students.length}><Check size={16} /> Save attendance</Button>} />
    <InlineNotice>{notice}</InlineNotice><InlineNotice tone="error">{error}</InlineNotice>
    <div className="attendance-controls panel"><SelectField label="Course" value={courseId} onChange={event => { setCourseId(event.target.value); setNotice(''); }} options={selectableCourses.map(item => ({ value: item.id, label: `${item.code} · ${item.name}` }))} /><label className="field"><span>Session date</span><input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={event => { setDate(event.target.value); setNotice(''); }} /></label><span className="session-state"><CalendarCheck2 size={16} /> {sessionRecords.length ? 'Existing session · editable' : 'New session'}</span></div>
    <div className="metric-grid attendance-metrics">
      <div className="metric-card metric-blue"><span className="metric-icon"><Users size={18} /></span><span className="metric-label">Enrolled students</span><strong>{students.length}</strong><span className="metric-detail">In {course?.code || 'selected course'}</span></div>
      <div className="metric-card metric-green"><span className="metric-icon"><Check size={18} /></span><span className="metric-label">Present today</span><strong>{presentCount}</strong><span className="metric-detail">{students.length ? Math.round((presentCount / students.length) * 100) : 0}% of roster</span></div>
      <div className="metric-card metric-orange"><span className="metric-icon"><CalendarCheck2 size={18} /></span><span className="metric-label">Average attendance</span><strong>{average}%</strong><span className="metric-detail">Across recorded sessions</span></div>
      <div className="metric-card metric-red"><span className="metric-icon"><CircleAlert size={18} /></span><span className="metric-label">Below 75%</span><strong>{belowThreshold}</strong><span className="metric-detail">Students needing follow-up</span></div>
    </div>
    <Panel className="table-panel"><PanelHeading title="Course roster" detail="Update attendance for the selected session" action={<div className="filter-tabs"><button className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}>All students</button><button className={filter === 'risk' ? 'selected' : ''} onClick={() => setFilter('risk')}>Below 75%</button><input aria-label="Filter roster" placeholder="Filter roster" value={filter !== 'all' && filter !== 'risk' ? filter : ''} onChange={event => setFilter(event.target.value || 'all')} /></div>} />
      {visible.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Student</th><th>Roll number</th><th>Overall attendance</th><th>{session.role === 'Student' ? 'Selected session' : 'Mark for session'}</th></tr></thead><tbody>{visible.map(({ student, rate }) => <tr key={student.id}><td><div className="student-cell"><span className="initial-avatar">{student.name.split(' ').map(part => part[0]).join('').slice(0, 2)}</span><span><strong>{student.name}</strong><small>{student.department} · Year {student.year}</small></span></div></td><td className="mono-label">{student.rollNumber}</td><td><div className="attendance-rate"><span className="rate-track"><i style={{ width: `${rate}%` }} /></span><Badge tone={rate < 75 ? 'red' : 'green'}>{rate}%</Badge></div></td><td>{session.role === 'Student' ? <Badge tone={draft[student.id] === 'Absent' ? 'red' : draft[student.id] === 'Present' ? 'green' : 'neutral'}>{draft[student.id] || 'Not recorded'}</Badge> : <div className="attendance-toggle"><button className={draft[student.id] === 'Present' ? 'active-present' : ''} onClick={() => changeDraft(current => ({ ...current, [student.id]: 'Present' }))}><Check size={14} /> Present</button><button className={draft[student.id] === 'Absent' ? 'active-absent' : ''} onClick={() => changeDraft(current => ({ ...current, [student.id]: 'Absent' }))}>Absent</button></div>}</td></tr>)}</tbody></table></div> : <div className="quiet-empty">No enrolled students match this view.</div>}
      {session.role !== 'Student' && <footer className="table-footer"><span>{sessionRecords.length ? `${sessionRecords.length} saved records for this date` : 'No saved records for this date yet'}</span><Button onClick={saveSession} disabled={!students.length}><Check size={16} /> Save session</Button></footer>}
    </Panel>
    <Panel className="attendance-history"><PanelHeading title="Attendance history" detail="Recent recorded sessions for the selected course" /><div className="table-scroll"><table className="data-table"><thead><tr><th>Session date</th><th>Recorded</th><th>Present</th><th>Absent</th><th>Attendance rate</th>{session.role !== 'Student' && <th>Action</th>}</tr></thead><tbody>{history.map(item => <tr key={item.date}><td>{new Date(`${item.date}T12:00:00`).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</td><td>{item.records.length}</td><td>{item.records.filter(record => record.status === 'Present').length}</td><td>{item.records.filter(record => record.status === 'Absent').length}</td><td><Badge tone={item.rate < 75 ? 'red' : 'green'}>{item.rate}%</Badge></td>{session.role !== 'Student' && <td><button className="table-action" onClick={() => { setDate(item.date); setNotice(''); }}>Open session</button></td>}</tr>)}</tbody></table></div>{history.length === 0 && <div className="quiet-empty">Attendance records will appear here after the first session is saved.</div>}</Panel>
    <p className="method-note">Attendance is calculated as present sessions divided by recorded sessions. Unrecorded sessions are excluded; zero recorded sessions returns 0%.</p>
  </>;
}