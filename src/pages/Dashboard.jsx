import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, ArrowRight, BookOpen, CalendarDays, CheckCircle2, CirclePlus, Clock3, GraduationCap, Megaphone, Users } from 'lucide-react';
import { CartesianGrid, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useCampusData } from '../services/useCampusData.js';
import { calculateDashboardStats, calculateGrade, calculateMarks, calculateAttendancePercentage } from '../services/domain.js';
import { Badge, Panel, PanelHeading, PageTitle } from '../components/ui.jsx';

const palette = ['#315f9d', '#2d8a7b', '#c47a43', '#8a9b50', '#7190c2', '#c35f63'];
const monthName = date => new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(`${date}T12:00:00`));

export function Dashboard({ session }) {
  const { data } = useCampusData();
  const stats = calculateDashboardStats(data);
  const isStudent = session.role === 'Student';
  const currentStudent = data.students.find(student => student.id === session.studentId) || data.students[0];
  const visibleStudents = isStudent ? data.students.filter(student => student.id === currentStudent?.id) : data.students;
  const enrollments = data.enrollments.filter(enrollment => !isStudent || enrollment.studentId === currentStudent?.id);
  const visibleCourseIds = new Set(enrollments.map(enrollment => enrollment.courseId));

  const monthBuckets = new Map();
  data.attendance.filter(record => !isStudent || record.studentId === currentStudent?.id).forEach(record => {
    const key = record.date.slice(0, 7);
    const current = monthBuckets.get(key) || { month: monthName(record.date), present: 0, total: 0, key };
    current.total += 1;
    if (record.status === 'Present') current.present += 1;
    monthBuckets.set(key, current);
  });
  const attendanceTrend = [...monthBuckets.values()].sort((a, b) => a.key.localeCompare(b.key)).map(item => ({ ...item, rate: Math.round((item.present / item.total) * 100) }));
  const departments = [...new Set(visibleStudents.map(student => student.department))].map(department => ({
    name: department,
    value: visibleStudents.filter(student => student.department === department).length,
  }));
  const coursePerformance = data.courses.filter(course => !isStudent || visibleCourseIds.has(course.id)).map(course => {
    const results = data.results.filter(result => result.courseId === course.id && (!isStudent || result.studentId === currentStudent?.id));
    return { name: course.code, average: results.length ? Math.round(results.reduce((sum, result) => sum + calculateMarks(result).percentage, 0) / results.length) : 0 };
  });
  const gradeDistribution = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(grade => ({
    grade,
    students: data.results.filter(result => (!isStudent || result.studentId === currentStudent?.id) && calculateGrade(calculateMarks(result).percentage) === grade).length,
  }));
  const latestEnrollments = [...data.enrollments].sort((a, b) => b.enrolledAt?.localeCompare(a.enrolledAt || '') || 0).slice(0, 5);
  const upcomingClasses = data.timetable.filter(item => {
    if (!isStudent) return true;
    const course = data.courses.find(courseRow => courseRow.id === item.courseId);
    return course?.department === currentStudent?.department && item.division === currentStudent?.division;
  }).slice(0, 4);
  const announcements = [...data.announcements].filter(item => !isStudent || (item.department === 'All departments' || item.department === currentStudent?.department)
    && (item.year === 'All years' || item.year === `Year ${currentStudent?.year}`)).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);
  const recentAnnouncementCount = data.announcements.filter(item => {
    const visible = !isStudent || (item.department === 'All departments' || item.department === currentStudent?.department)
      && (item.year === 'All years' || item.year === `Year ${currentStudent?.year}`);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return visible && item.publishedAt >= weekAgo.toISOString().slice(0, 10);
  }).length;
  const riskStudents = isStudent ? stats.atRisk.filter(student => student.id === currentStudent?.id) : stats.atRisk.slice(0, 4);

  const metrics = [
    { label: isStudent ? 'My student profile' : 'Total students', value: isStudent ? '01' : String(stats.totalStudents).padStart(2, '0'), detail: isStudent ? 'Your academic profile' : `${data.students.filter(student => student.status !== 'Active').length} records need review`, icon: Users, to: isStudent ? '/academics' : '/students', color: 'blue' },
    { label: 'Active courses', value: String(isStudent ? enrollments.length : stats.activeCourses).padStart(2, '0'), detail: isStudent ? 'Currently enrolled' : `${data.enrollments.length} active enrollments`, icon: BookOpen, to: '/courses', color: 'green' },
    { label: 'Average attendance', value: `${isStudent ? calculateAttendancePercentage(data.attendance.filter(record => record.studentId === currentStudent?.id)) : stats.averageAttendance}%`, detail: 'Across recorded sessions', icon: Activity, to: '/attendance', color: 'orange' },
    { label: 'Academic performance', value: `${isStudent ? Math.round(data.results.filter(result => result.studentId === currentStudent?.id).reduce((sum, result) => sum + calculateMarks(result).percentage, 0) / Math.max(1, data.results.filter(result => result.studentId === currentStudent?.id).length)) : stats.averagePerformance}%`, detail: 'Weighted score average', icon: GraduationCap, to: '/academics', color: 'blue' },
    { label: isStudent ? 'My academic status' : 'Students at risk', value: isStudent ? (stats.atRisk.some(student => student.id === currentStudent?.id) ? '01' : '00') : String(stats.studentsAtRisk).padStart(2, '0'), detail: 'Attendance below 75% or marks below 40%', icon: AlertTriangle, to: isStudent ? '/attendance' : '/reports', color: 'red' },
    { label: 'New announcements', value: String(isStudent ? recentAnnouncementCount : stats.pendingAnnouncements).padStart(2, '0'), detail: 'Published in the last 7 days', icon: Megaphone, to: '/announcements', color: 'green' },
  ];

  return <>
    <PageTitle eyebrow="ACADEMIC OVERVIEW" title={isStudent ? `Good morning, ${currentStudent?.name.split(' ')[0]}` : 'Academic dashboard'} detail={isStudent ? 'Your learning activity, attendance, and progress at a glance.' : 'A real-time view of student activity and academic progress.'} actions={<span className="date-chip"><CalendarDays size={15} /> {new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span>} />
    <div className="metric-grid">
      {metrics.map(({ label, value, detail, icon: Icon, to, color }) => <Link key={label} to={to} className={`metric-card metric-${color}`}>
        <span className="metric-icon"><Icon size={18} /></span><span className="metric-label">{label}</span><strong>{value}</strong><span className="metric-detail">{detail}</span><ArrowRight className="metric-arrow" size={16} />
      </Link>)}
    </div>

    <div className="chart-grid chart-grid-primary">
      <Panel className="chart-panel">
        <PanelHeading title="Attendance trend" detail="Recorded sessions by month" action={<Link className="text-link" to="/attendance">View attendance <ArrowRight size={14} /></Link>} />
        <div className="chart-box"><ResponsiveContainer width="100%" height="100%"><LineChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#e9edf2" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#778394', fontSize: 12 }} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#778394', fontSize: 11 }} /><Tooltip formatter={value => [`${value}%`, 'Attendance']} /><Line type="monotone" dataKey="rate" stroke="#315f9d" strokeWidth={2.5} dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} />
        </LineChart></ResponsiveContainer></div>
      </Panel>
      <Panel className="chart-panel distribution-panel">
        <PanelHeading title="Student distribution" detail="By department" />
        <div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={departments} dataKey="value" nameKey="name" innerRadius={61} outerRadius={87} paddingAngle={3} stroke="none">{departments.map((item, index) => <Cell key={item.name} fill={palette[index % palette.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{data.students.length}</strong><span>Students</span></div></div>
        <div className="legend-list">{departments.map((item, index) => <div key={item.name}><span style={{ '--legend-color': palette[index % palette.length] }} />{item.name}<strong>{item.value}</strong></div>)}</div>
      </Panel>
    </div>

    <div className="chart-grid chart-grid-secondary">
      <Panel className="chart-panel"><PanelHeading title="Course performance" detail="Average assessed score, out of 100" /><div className="chart-box short-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={coursePerformance} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}><CartesianGrid stroke="#e9edf2" vertical={false} /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#778394', fontSize: 11 }} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#778394', fontSize: 11 }} /><Tooltip formatter={value => [`${value}%`, 'Average score']} /><Bar dataKey="average" fill="#2d8a7b" radius={[4, 4, 0, 0]} maxBarSize={32} /></BarChart></ResponsiveContainer></div></Panel>
      <Panel className="chart-panel"><PanelHeading title="Performance distribution" detail="Recorded result grades" /><div className="chart-box short-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={gradeDistribution} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}><CartesianGrid stroke="#e9edf2" vertical={false} /><XAxis dataKey="grade" tickLine={false} axisLine={false} tick={{ fill: '#778394', fontSize: 11 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#778394', fontSize: 11 }} /><Tooltip /><Bar dataKey="students" fill="#c47a43" radius={[4, 4, 0, 0]} maxBarSize={32} /></BarChart></ResponsiveContainer></div></Panel>
    </div>

    {!isStudent && <div className="quick-actions panel">
      <div><span className="eyebrow">WORKSPACE</span><h2>Quick actions</h2></div>
      <Link to="/students?action=add"><CirclePlus size={17} /> Add student</Link>
      <Link to="/attendance"><CheckCircle2 size={17} /> Mark attendance</Link>
      <Link to="/academics?action=add"><GraduationCap size={17} /> Add marks</Link>
      <Link to="/announcements?action=add"><Megaphone size={17} /> New announcement</Link>
    </div>}

    <div className="lower-grid">
      {!isStudent && <Panel><PanelHeading title="Recent enrollments" detail="Latest additions to the student roster" action={<Link className="text-link" to="/students">All students <ArrowRight size={14} /></Link>} />
        <div className="compact-list">{latestEnrollments.map(enrollment => {
          const student = data.students.find(item => item.id === enrollment.studentId);
          const course = data.courses.find(item => item.id === enrollment.courseId);
          if (!student) return null;
          return <div className="compact-row" key={enrollment.id}><span className="initial-avatar">{student.name.split(' ').map(part => part[0]).join('').slice(0, 2)}</span><span className="compact-main"><strong>{student.name}</strong><small>{student.department} · Year {student.year}</small></span><span className="compact-side"><strong>{course?.code}</strong><small>{enrollment.enrolledAt ? new Date(`${enrollment.enrolledAt}T12:00:00`).toLocaleDateString('en', { day: 'numeric', month: 'short' }) : 'Enrolled'}</small></span></div>;
        })}</div>
      </Panel>}
      <Panel><PanelHeading title="Upcoming classes" detail="Scheduled teaching sessions" action={<Link className="text-link" to="/timetable">Timetable <ArrowRight size={14} /></Link>} />
        <div className="compact-list">{upcomingClasses.map(item => {
          const course = data.courses.find(courseRow => courseRow.id === item.courseId);
          return <div className="class-row" key={item.id}><span className="class-time"><strong>{item.startTime}</strong><small>{item.day.slice(0, 3)}</small></span><span className="class-bar" /><span className="compact-main"><strong>{course?.name}</strong><small>{course?.faculty} · {item.room}</small></span></div>;
        })}</div>
      </Panel>
      <Panel><PanelHeading title="Recent announcements" detail="Latest campus updates" action={<Link className="text-link" to="/announcements">View all <ArrowRight size={14} /></Link>} />
        <div className="announcement-list">{announcements.map(item => <article className="announcement-teaser" key={item.id}><span className="announcement-dot" /><div><div className="announcement-meta"><Badge tone={item.priority === 'High' ? 'orange' : 'blue'}>{item.category}</Badge><span>{new Date(`${item.publishedAt}T12:00:00`).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</span></div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div>
      </Panel>
      {!isStudent && <Panel><PanelHeading title="Needs attention" detail="Attendance under 75% or marks below passing" action={<Link className="text-link" to="/reports">Open report <ArrowRight size={14} /></Link>} />
        {riskStudents.length ? <div className="compact-list">{riskStudents.map(student => {
          const records = data.attendance.filter(record => record.studentId === student.id);
          const rate = calculateAttendancePercentage(records);
          return <div className="compact-row" key={student.id}><span className="initial-avatar avatar-alert">{student.name.split(' ').map(part => part[0]).join('').slice(0, 2)}</span><span className="compact-main"><strong>{student.name}</strong><small>{student.rollNumber} · {student.department}</small></span><Badge tone="red">{rate}% attendance</Badge></div>;
        })}</div> : <div className="quiet-empty"><CheckCircle2 size={18} /> No students currently flagged for risk.</div>}
      </Panel>}
      <Panel><PanelHeading title="Academic calendar" detail="Upcoming milestones" action={<span className="panel-icon"><CalendarDays size={16} /></span>} />
        <div className="calendar-list">{data.calendar.map(event => <div key={event.id}><span className="calendar-date"><strong>{new Date(`${event.date}T12:00:00`).toLocaleDateString('en', { day: '2-digit' })}</strong><small>{new Date(`${event.date}T12:00:00`).toLocaleDateString('en', { month: 'short' })}</small></span><span><strong>{event.title}</strong><small>{event.type}</small></span></div>)}</div>
      </Panel>
    </div>
    {isStudent && <div className="student-summary-note"><Clock3 size={17} /> Your dashboard shows your own academic records only.</div>}
    {visibleStudents.length === 0 && <p className="muted">No student profile is assigned to this demo session.</p>}
  </>;
}