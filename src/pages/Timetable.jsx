import { useState } from 'react';
import { Clock3, Pencil, Plus } from 'lucide-react';
import { useCampusData } from '../services/useCampusData.js';
import { saveTimetableEntry } from '../services/domain.js';
import { Badge, Button, Field, InlineNotice, Modal, PageTitle, Panel, SelectField } from '../components/ui.jsx';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const blankClass = { day: 'Monday', startTime: '09:00', endTime: '10:00', courseId: '', room: '', division: 'A' };

export function TimetablePage({ session }) {
  const { data, updateData } = useCampusData();
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const student = data.students.find(item => item.id === session.studentId);
  const visibleEntries = data.timetable.filter(item => {
    if (session.role !== 'Student') return true;
    const course = data.courses.find(row => row.id === item.courseId);
    return course?.department === student?.department && item.division === student?.division;
  });

  function save(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const timetable = saveTimetableEntry(data.timetable, form, data.courses, editor.editingId);
      updateData({ ...data, timetable });
      setNotice(editor.editingId ? 'Class updated.' : 'Class added to the timetable.');
      setEditor(null);
      setError('');
    } catch (saveError) { setError(saveError.message); }
  }

  return <>
    <PageTitle eyebrow="TEACHING SCHEDULE" title="Timetable" detail={session.role === 'Student' ? 'Your weekly schedule by department and division.' : 'Weekly class schedule across classrooms and divisions.'} actions={session.role !== 'Student' && <Button onClick={() => { setEditor({ ...blankClass, courseId: data.courses[0]?.id || '' }); setError(''); }}><Plus size={16} /> Add class</Button>} />
    <InlineNotice>{notice}</InlineNotice><InlineNotice tone="error">{error}</InlineNotice>
    <div className="timetable-grid">{weekDays.map(day => {
      const entries = visibleEntries.filter(item => item.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
      return <Panel className={`day-column ${day === new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date()) ? 'today-column' : ''}`} key={day}><div className="day-heading"><span>{day.slice(0, 3)}</span><small>{day}</small></div>
        {entries.length ? <div className="day-classes">{entries.map(item => {
          const course = data.courses.find(row => row.id === item.courseId);
          return <article key={item.id} className="class-card"><div className="class-card-top"><Badge tone={course?.department === 'Electronics' ? 'orange' : course?.department === 'Business Analytics' ? 'green' : 'blue'}>{course?.code}</Badge>{session.role !== 'Student' && <button aria-label={`Edit ${course?.code} class`} onClick={() => { setEditor({ ...item, editingId: item.id }); setError(''); }}><Pencil size={14} /></button>}</div><h3>{course?.name || 'Course unavailable'}</h3><p><Clock3 size={13} /> {item.startTime}–{item.endTime}</p><div className="class-card-meta"><span>{course?.faculty}</span><span>{item.room}</span></div><div className="class-card-meta"><span>{course?.department}</span><span>Div {item.division}</span></div></article>;
        })}</div> : <div className="day-empty">No classes</div>}
      </Panel>;
    })}</div>

    {editor && <Modal title={editor.editingId ? 'Edit timetable entry' : 'Add timetable entry'} description="Overlapping classes cannot share a room or department division." onClose={() => setEditor(null)}>
      <form className="form-grid one-column" onSubmit={save}><SelectField label="Day" name="day" defaultValue={editor.day} options={weekDays} /><SelectField label="Course" name="courseId" defaultValue={editor.courseId} options={data.courses.map(course => ({ value: course.id, label: `${course.code} · ${course.name}` }))} /><div className="score-row"><Field label="Start time" name="startTime" type="time" defaultValue={editor.startTime} required /><Field label="End time" name="endTime" type="time" defaultValue={editor.endTime} required /></div><div className="score-row"><Field label="Classroom" name="room" defaultValue={editor.room} required placeholder="A-204" /><SelectField label="Division" name="division" defaultValue={editor.division} options={['A', 'B', 'C']} /></div>{error && <InlineNotice tone="error">{error}</InlineNotice>}<div className="modal-actions"><Button type="button" variant="secondary" onClick={() => setEditor(null)}>Cancel</Button><Button type="submit">Save schedule</Button></div></form>
    </Modal>}
  </>;
}