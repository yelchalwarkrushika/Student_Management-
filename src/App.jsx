import { lazy, Suspense, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Bell, BookOpen, CalendarDays, CalendarRange, ChevronDown, ChevronLeft, ChevronRight, Ellipsis, GraduationCap, LayoutDashboard, LogOut, Menu, Megaphone, Search, Settings, ShieldCheck, Users, X } from 'lucide-react';
import { useCampusData } from './services/useCampusData.js';
import { calculateDashboardStats } from './services/domain.js';
import { Badge, Button, SelectField } from './components/ui.jsx';

const sessionKey = 'campusflow-session';
const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', path: '/students', icon: Users, admin: true },
  { label: 'Attendance', path: '/attendance', icon: CalendarDays },
  { label: 'Academics', path: '/academics', icon: GraduationCap },
  { label: 'Courses', path: '/courses', icon: BookOpen },
  { label: 'Timetable', path: '/timetable', icon: CalendarRange },
  { label: 'Announcements', path: '/announcements', icon: Megaphone },
  { label: 'Reports', path: '/reports', icon: Activity, admin: true },
  { label: 'Settings', path: '/settings', icon: Settings, admin: true },
];
const Dashboard = lazy(() => import('./pages/Dashboard.jsx').then(module => ({ default: module.Dashboard })));
const StudentsPage = lazy(() => import('./pages/Students.jsx').then(module => ({ default: module.StudentsPage })));
const AttendancePage = lazy(() => import('./pages/Attendance.jsx').then(module => ({ default: module.AttendancePage })));
const AcademicsPage = lazy(() => import('./pages/Academics.jsx').then(module => ({ default: module.AcademicsPage })));
const CoursesPage = lazy(() => import('./pages/Courses.jsx').then(module => ({ default: module.CoursesPage })));
const TimetablePage = lazy(() => import('./pages/Timetable.jsx').then(module => ({ default: module.TimetablePage })));
const AnnouncementsPage = lazy(() => import('./pages/Announcements.jsx').then(module => ({ default: module.AnnouncementsPage })));
const ReportsPage = lazy(() => import('./pages/Reports.jsx').then(module => ({ default: module.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/Settings.jsx').then(module => ({ default: module.SettingsPage })));

function readSession() {
  try { return JSON.parse(localStorage.getItem(sessionKey) || 'null'); }
  catch { return null; }
}

function Login({ onLogin }) {
  const { data } = useCampusData();
  const [role, setRole] = useState('Administrator');
  const [studentId, setStudentId] = useState(data.students[0]?.id || '');
  return <main className="login-layout">
    <div className="login-aside"><Link to="/login" className="brand brand-login"><span className="brand-mark">CF</span><span>campus<span>flow</span></span></Link><div className="login-message"><span className="eyebrow">ACADEMIC OPERATIONS</span><h1>Every part of campus, in sync.</h1><p>A considered workspace for student records, attendance, academic progress, and the work that moves learning forward.</p><div className="login-illustration"><span className="orbit orbit-a" /><span className="orbit orbit-b" /><div className="campus-glyph"><span /><span /><span /><span /><span /></div><div className="illustration-label"><GraduationCap size={16} /> CAMPUSFLOW · ACADEMIC PORTAL</div></div></div><small className="login-foot">FICTIONAL DEMONSTRATION DATA · 2026</small></div>
    <section className="login-main"><div className="login-card"><span className="eyebrow">DEMO ACCESS</span><h2>Welcome to CampusFlow</h2><p className="login-subtitle">Choose a demonstration role to enter the portal. No password is collected or stored.</p><div className="role-tabs" role="group" aria-label="Choose demonstration role"><button className={role === 'Administrator' ? 'active' : ''} onClick={() => setRole('Administrator')}><ShieldCheck size={17} /> Administrator</button><button className={role === 'Student' ? 'active' : ''} onClick={() => setRole('Student')}><GraduationCap size={17} /> Student</button></div>{role === 'Student' && <SelectField label="Student profile" value={studentId} onChange={event => setStudentId(event.target.value)} options={data.students.map(student => ({ value: student.id, label: `${student.name} · ${student.rollNumber}` }))} />}<Button className="login-submit" onClick={() => onLogin(role, studentId)}>Enter demo portal <ChevronRight size={17} /></Button><div className="login-disclaimer"><ShieldCheck size={15} /><span>For assessment demonstration only. Browser-based roles are not secure authorization.</span></div></div><span className="login-version">CampusFlow Academic Portal <span>·</span> Demo v1.0</span></section>
  </main>;
}

function PortalShell({ session, onLogout }) {
  const { data } = useCampusData();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const stats = calculateDashboardStats(data);
  const current = navigation.find(item => location.pathname === item.path) || navigation[0];
  const visibleNavigation = navigation.filter(item => session.role === 'Administrator' || !item.admin);
  const student = data.students.find(item => item.id === session.studentId);
  const userName = session.role === 'Administrator' ? 'Admin Workspace' : student?.name || 'Student';
  const accessibleAnnouncements = data.announcements.filter(item => session.role !== 'Student' || (item.department === 'All departments' || item.department === student?.department)
    && (item.year === 'All years' || item.year === `Year ${student?.year}`));
  const announcements = [...accessibleAnnouncements].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 4);
  const announcementCount = session.role === 'Administrator' ? stats.pendingAnnouncements : accessibleAnnouncements.filter(item => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return item.publishedAt >= weekAgo.toISOString().slice(0, 10);
  }).length;

  function search(event) {
    event.preventDefault();
    if (!searchText.trim()) return;
    const path = session.role === 'Administrator' ? '/students' : '/announcements';
    navigate(`${path}?q=${encodeURIComponent(searchText.trim())}`);
    setSearchText('');
  }

  return <div className={`portal ${collapsed ? 'sidebar-collapsed' : ''}`}>
    {mobileOpen && <button aria-label="Close navigation overlay" className="mobile-scrim" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand"><Link to="/dashboard" className="brand"><span className="brand-mark">CF</span><span className="brand-name">campus<span>flow</span></span></Link><button className="sidebar-collapse" aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} title={collapsed ? 'Expand navigation' : 'Collapse navigation'} onClick={() => setCollapsed(value => !value)}>{collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</button></div>
      <div className="workspace-switch"><span className="workspace-icon">N</span><span className="workspace-copy"><strong>Northbridge Institute</strong><small>Academic workspace</small></span><ChevronDown size={15} /></div>
      <span className="nav-caption">WORKSPACE</span>
      <nav className="main-nav" aria-label="Main navigation">{visibleNavigation.map(({ label, path, icon: Icon }) => <NavLink to={path} key={path} title={collapsed ? label : undefined} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'Announcements' && announcementCount > 0 && <i className="nav-count">{announcementCount}</i>}</NavLink>)}</nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-help"><span className="help-icon"><ShieldCheck size={17} /></span><div><strong>Demo environment</strong><small>Fictional student records</small></div></div>
      <button className="sidebar-user" onClick={() => setProfileOpen(value => !value)}><span className="user-avatar">{session.role === 'Administrator' ? 'AD' : student?.name.split(' ').map(part => part[0]).join('').slice(0, 2)}</span><span className="user-copy"><strong>{userName}</strong><small>{session.role} · Demo access</small></span><MoreIcon /></button>
    </aside>

    <div className="main-shell"><header className="topbar"><div className="topbar-title"><button className="mobile-menu-button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileOpen(value => !value)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button><div><span className="breadcrumbs">Workspace <span>/</span> {current.label}</span><h1>{current.label}</h1></div></div><div className="topbar-tools"><form className="global-search" onSubmit={search}><Search size={16} /><input aria-label="Global search" placeholder="Search records..." value={searchText} onChange={event => setSearchText(event.target.value)} /></form><span className="topbar-divider" /><span className="topbar-date">{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date())}</span><div className="popover-anchor"><button aria-label={`Notifications, ${announcementCount} recent`} className={`topbar-icon ${notificationsOpen ? 'tool-active' : ''}`} onClick={() => { setNotificationsOpen(value => !value); setProfileOpen(false); }}><Bell size={18} />{announcementCount > 0 && <i className="notification-dot" />}</button>{notificationsOpen && <div className="header-popover notification-popover"><div className="popover-heading"><strong>Recent announcements</strong><Badge tone="blue">{announcementCount} new</Badge></div>{announcements.map(item => <Link to="/announcements" key={item.id} onClick={() => setNotificationsOpen(false)}><span className="popover-dot" /><span><strong>{item.title}</strong><small>{new Date(`${item.publishedAt}T12:00:00`).toLocaleDateString('en', { day: 'numeric', month: 'short' })} · {item.category}</small></span></Link>)}{announcements.length === 0 && <p className="muted">No announcements yet.</p>}<Link className="popover-footer" to="/announcements" onClick={() => setNotificationsOpen(false)}>Open announcements <ChevronRight size={15} /></Link></div>}</div><div className="popover-anchor"><button className="topbar-profile" onClick={() => { setProfileOpen(value => !value); setNotificationsOpen(false); }}><span className="user-avatar">{session.role === 'Administrator' ? 'AD' : student?.name.split(' ').map(part => part[0]).join('').slice(0, 2)}</span><ChevronDown size={14} /></button>{profileOpen && <div className="header-popover profile-popover"><div className="profile-popover-user"><strong>{userName}</strong><small>{session.role} · Demonstration</small></div><button onClick={() => { setProfileOpen(false); onLogout(); }}><LogOut size={15} /> End demo session</button></div>}</div></div></header>
      {profileOpen && <button aria-label="Close profile menu" className="popover-dismiss" onClick={() => setProfileOpen(false)} />}
      <main className="page-content" onClick={() => { if (notificationsOpen) setNotificationsOpen(false); }}><Suspense fallback={<div className="page-loading">Loading workspace...</div>}><Routes>
        <Route path="/dashboard" element={<Dashboard session={session} />} />
        <Route path="/students" element={session.role === 'Administrator' ? <StudentsPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/attendance" element={<AttendancePage session={session} />} />
        <Route path="/academics" element={<AcademicsPage session={session} />} />
        <Route path="/courses" element={<CoursesPage session={session} />} />
        <Route path="/timetable" element={<TimetablePage session={session} />} />
        <Route path="/announcements" element={<AnnouncementsPage session={session} />} />
        <Route path="/reports" element={session.role === 'Administrator' ? <ReportsPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/settings" element={session.role === 'Administrator' ? <SettingsPage session={session} onLogout={onLogout} /> : <Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes></Suspense><footer className="page-footer"><span>CampusFlow · Academic operations</span><span>Client-side demonstration · Not for sensitive student data</span></footer></main>
    </div>
  </div>;
}

function MoreIcon() {
  return <Ellipsis className="more-dots" size={16} aria-hidden="true" />;
}

export function App() {
  const [session, setSession] = useState(readSession);
  const navigate = useNavigate();
  function login(role, studentId) {
    const next = { role, studentId: role === 'Student' ? studentId : null };
    localStorage.setItem(sessionKey, JSON.stringify(next));
    setSession(next);
    navigate('/dashboard', { replace: true });
  }
  function logout() {
    localStorage.removeItem(sessionKey);
    setSession(null);
    navigate('/login', { replace: true });
  }
  if (!session) return <Routes><Route path="*" element={<Login onLogin={login} />} /></Routes>;
  if (!navigation.some(item => item.path === window.location.hash.replace(/^#/, '').split('?')[0])) {
    return <Navigate to="/dashboard" replace />;
  }
  return <PortalShell session={session} onLogout={logout} />;
}