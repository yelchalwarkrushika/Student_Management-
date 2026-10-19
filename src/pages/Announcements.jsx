import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Megaphone, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCampusData } from '../services/useCampusData.js';
import { saveAnnouncement } from '../services/domain.js';
import { Badge, Button, EmptyState, Field, InlineNotice, Modal, PageTitle, Panel, SelectField } from '../components/ui.jsx';

const blankAnnouncement = { title: '', description: '', category: 'Academic', priority: 'Normal', publishedAt: new Date().toISOString().slice(0, 10), department: 'All departments', year: 'All years' };

export function AnnouncementsPage({ session }) {
  const { data, updateData } = useCampusData();
  const [searchParams, setSearchParams] = useSearchParams();
  const addAction = searchParams.get('action') === 'add' && session.role !== 'Student';
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('All categories');
  const [editor, setEditor] = useState(() => addAction ? blankAnnouncement : null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const student = data.students.find(item => item.id === session.studentId);

  useEffect(() => {
    if (addAction) setSearchParams({}, { replace: true });
  }, [addAction, setSearchParams]);

  const announcements = useMemo(() => data.announcements.filter(item => {
    const visibleToStudent = session.role !== 'Student' || (item.department === 'All departments' || item.department === student?.department)
      && (item.year === 'All years' || item.year === `Year ${student?.year}`);
    return visibleToStudent && (category === 'All categories' || item.category === category)
      && `${item.title} ${item.description} ${item.department}`.toLowerCase().includes(query.toLowerCase());
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), [data.announcements, session.role, student, category, query]);

  function save(event) {
    event.preventDefault();
    try {
      const input = Object.fromEntries(new FormData(event.currentTarget).entries());
      updateData({ ...data, announcements: saveAnnouncement(data.announcements, input, editor.editingId) });
      setNotice(editor.editingId ? 'Announcement updated.' : 'Announcement published.');
      setEditor(null);
      setError('');
    } catch (saveError) { setError(saveError.message); }
  }

  return <>
    <PageTitle eyebrow="CAMPUS COMMUNICATION" title="Announcements" detail="Share academic notices and campus updates with the right audience." actions={session.role !== 'Student' && <Button onClick={() => { setEditor(blankAnnouncement); setError(''); }}><Plus size={16} /> New announcement</Button>} />
    <InlineNotice>{notice}</InlineNotice><InlineNotice tone="error">{error}</InlineNotice>
    <Panel className="table-panel"><div className="toolbar"><label className="search-field"><Search size={17} /><input aria-label="Search announcements" placeholder="Search announcements" value={query} onChange={event => setQuery(event.target.value)} /></label><SelectField label="Category" value={category} onChange={event => setCategory(event.target.value)} options={['All categories', 'Academic', 'Campus', 'Course', 'Event']} /><span className="toolbar-count">{announcements.length} published notices</span></div>
      {announcements.length ? <div className="announcement-feed">{announcements.map(item => <article className="announcement-card" key={item.id}><div className="announcement-card-icon"><Megaphone size={19} /></div><div className="announcement-card-content"><div className="announcement-card-meta"><Badge tone={item.priority === 'High' ? 'orange' : item.category === 'Event' ? 'green' : 'blue'}>{item.category}</Badge>{item.priority === 'High' && <Badge tone="red">High priority</Badge>}<span>{new Date(`${item.publishedAt}T12:00:00`).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div><h2>{item.title}</h2><p>{item.description}</p><div className="audience-meta">Audience: {item.department} · {item.year}</div></div>{session.role !== 'Student' && <div className="announcement-actions"><button aria-label={`Edit ${item.title}`} title="Edit announcement" onClick={() => { setEditor({ ...item, editingId: item.id }); setError(''); }}><Pencil size={15} /></button><button aria-label={`Delete ${item.title}`} title="Delete announcement" onClick={() => setDeleting(item)}><Trash2 size={15} /></button></div>}</article>)}</div> : <EmptyState title="No announcements found" detail="Try a different search or publish a new announcement." action={session.role !== 'Student' && <Button onClick={() => setEditor(blankAnnouncement)}><Plus size={16} /> New announcement</Button>} />}
    </Panel>

    {editor && <Modal title={editor.editingId ? 'Edit announcement' : 'Create announcement'} description="Choose who should receive this campus update." onClose={() => setEditor(null)} wide><form className="form-grid" onSubmit={save}><Field label="Title" name="title" defaultValue={editor.title} required placeholder="Announcement title" /><Field label="Publication date" name="publishedAt" type="date" defaultValue={editor.publishedAt} required /><label className="field field-span"><span>Description</span><textarea name="description" rows="4" defaultValue={editor.description} required placeholder="Write a concise campus update" /></label><SelectField label="Category" name="category" defaultValue={editor.category} options={['Academic', 'Campus', 'Course', 'Event']} /><SelectField label="Priority" name="priority" defaultValue={editor.priority} options={['Normal', 'High']} /><SelectField label="Target department" name="department" defaultValue={editor.department} options={['All departments', 'Computer Science', 'Information Technology', 'Electronics', 'Business Analytics']} /><SelectField label="Target year" name="year" defaultValue={editor.year} options={['All years', 'Year 1', 'Year 2', 'Year 3', 'Year 4']} />{error && <InlineNotice tone="error">{error}</InlineNotice>}<div className="modal-actions"><Button type="button" variant="secondary" onClick={() => setEditor(null)}>Cancel</Button><Button type="submit">{editor.editingId ? 'Save changes' : 'Publish announcement'}</Button></div></form></Modal>}

    {deleting && <Modal title="Delete announcement?" description="Students will no longer see this notice." onClose={() => setDeleting(null)}><div className="confirm-copy"><span className="confirm-icon"><Trash2 size={20} /></span><p>Delete <strong>{deleting.title}</strong> from the announcements feed?</p></div><div className="modal-actions"><Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" onClick={() => { updateData({ ...data, announcements: data.announcements.filter(item => item.id !== deleting.id) }); setDeleting(null); setNotice('Announcement deleted.'); }}>Delete announcement</Button></div></Modal>}
  </>;
}