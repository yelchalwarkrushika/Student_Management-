import { useState } from 'react';
import { Database, LogOut, RotateCcw, ShieldCheck } from 'lucide-react';
import { useCampusData } from '../services/useCampusData.js';
import { resetData } from '../services/store.js';
import { Button, InlineNotice, Modal, PageTitle, Panel, PanelHeading } from '../components/ui.jsx';

export function SettingsPage({ session, onLogout }) {
  const { data, updateData } = useCampusData();
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState('');

  return <>
    <PageTitle eyebrow="PORTAL PREFERENCES" title="Settings" detail="Manage this browser's demonstration data and review the limits of the demo session." />
    <InlineNotice>{notice}</InlineNotice>
    <div className="settings-grid"><Panel><PanelHeading title="Demo session" detail="A simple role switch for assessment demonstrations." /><div className="settings-profile"><span className="profile-avatar">{session.role === 'Administrator' ? 'AD' : 'ST'}</span><div><strong>{session.role}</strong><small>{session.role === 'Student' ? data.students.find(student => student.id === session.studentId)?.name : 'CampusFlow workspace'}</small></div></div><div className="settings-warning"><ShieldCheck size={19} /><p>This is a client-side demonstration session only. It does not authenticate users securely and must not be used to protect sensitive student information.</p></div><Button variant="secondary" onClick={onLogout}><LogOut size={16} /> End demo session</Button></Panel>
      <Panel><PanelHeading title="Local data" detail="Portal records are stored in this browser using LocalStorage." /><div className="storage-stats"><div><span>Students</span><strong>{data.students.length}</strong></div><div><span>Courses</span><strong>{data.courses.length}</strong></div><div><span>Attendance records</span><strong>{data.attendance.length}</strong></div><div><span>Academic results</span><strong>{data.results.length}</strong></div></div>{session.role === 'Administrator' && <Button variant="danger-outline" onClick={() => setConfirmReset(true)}><RotateCcw size={16} /> Reset demo data</Button>}<p className="settings-footnote"><Database size={14} /> Reset restores the original fictional seed records and removes local changes.</p></Panel>
    </div>
    {confirmReset && <Modal title="Reset all demo data?" description="Your changes in this browser will be permanently removed." onClose={() => setConfirmReset(false)}><div className="confirm-copy"><span className="confirm-icon"><RotateCcw size={20} /></span><p>This restores the original 30-student CampusFlow dataset, including attendance, grades, timetable, courses, and announcements.</p></div><div className="modal-actions"><Button variant="secondary" onClick={() => setConfirmReset(false)}>Cancel</Button><Button variant="danger" onClick={() => { updateData(resetData()); setConfirmReset(false); setNotice('Demo records restored to their original state.'); }}>Reset demo data</Button></div></Modal>}
  </>;
}