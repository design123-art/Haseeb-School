// ============================================================
// Al-Haseeb Model Sec. School — Teacher Portal
// Renders the sidebar + topbar shared across every page.
// ============================================================
import {
  auth, dbx, doc, getDoc, getDocs, collection, query, where, signOut, $,
  ROLE_LABELS, initials, getAccessibleClasses, getActiveClassId, setActiveClassId
} from './teacher-common.js';

const NAV = [
  { id: 'dashboard',       href: 'dashboard.html',        icon: '🏠', label: 'Dashboard' },
  { id: 'attendance',      href: 'mark-attendance.html',  icon: '📋', label: 'Mark Attendance' },
  { id: 'myAttendance',    href: 'my-attendance.html',    icon: '🗓️', label: 'My Attendance' },
  { id: 'complaints',      href: 'complaints.html',       icon: '📝', label: 'Student Complaints' },
  { id: 'studentRegister', href: 'register.html',         icon: '📘', label: 'Attendance Register' },
  { id: 'notifications',   href: 'notifications.html',    icon: '🔔', label: 'Notifications', badge: true },
  { id: 'profile',         href: 'profile.html',          icon: '🙍', label: 'My Profile' }
];

/**
 * renderTeacherShell({ active, title, subtitle })
 * Mounts sidebar into #sidebar-mount and topbar into #topbar-mount,
 * then resolves with { teacher, accessibleClasses, classId } once the
 * signed-in teacher's identity + class(es) are known.
 */
export async function renderTeacherShell({ active, title, subtitle, teacher }){
  const sidebarMount = $('sidebar-mount');
  const topbarMount = $('topbar-mount');

  sidebarMount.innerHTML = `
    <div class="dt-logo">
      <img src="icon-192.png" alt="">
      <div><b>Al-Haseeb Model<br>Sec. School</b><span>Teacher Portal</span></div>
    </div>
    <div class="dt-nav">
      ${NAV.map(n => `<a class="dt-nav-item ${n.id === active ? 'active' : ''}" href="${n.href}">
        <span class="ic">${n.icon}</span>${n.label}
        ${n.badge ? `<span class="badge hidden" id="navNotifBadge">0</span>` : ''}
      </a>`).join('')}
    </div>
    <div class="dt-sidebar-foot"><button class="dt-logout" id="logoutBtn">Log Out</button></div>
  `;
  $('logoutBtn').addEventListener('click', () => signOut(auth));

  topbarMount.innerHTML = `
    <div class="dt-title">
      <h1>${title}</h1>
      <p>${subtitle || ''}</p>
    </div>
    <div class="dt-who">
      <select class="hidden" id="classSwitcher"></select>
      <div class="avatar" id="teacherAvatar">—</div>
      <div>
        <div class="topbar-name" id="teacherName">—</div>
        <div class="who" id="teacherClass">—</div>
      </div>
    </div>
  `;

  if (!teacher) return { teacher: null, accessibleClasses: [], classId: null };

  $('teacherName').textContent = teacher.name || '—';
  $('teacherAvatar').textContent = initials(teacher.name);

  const accessibleClasses = await getAccessibleClasses(teacher);
  let classId = getActiveClassId(teacher, accessibleClasses);
  const activeClass = accessibleClasses.find(c => c.id === classId);

  if (teacher.role === 'teacher') {
    $('teacherClass').textContent = activeClass
      ? `Class ${activeClass.className || ''}${activeClass.section ? ' - ' + activeClass.section : ''}`.trim()
      : 'No class assigned';
  } else {
    $('teacherClass').textContent = ROLE_LABELS[teacher.role] || '';
    if (accessibleClasses.length) {
      const sw = $('classSwitcher');
      sw.classList.remove('hidden');
      sw.innerHTML = accessibleClasses.map(c =>
        `<option value="${c.id}" ${c.id === classId ? 'selected' : ''}>${c.className || ''}${c.section ? ' - ' + c.section : ''}</option>`
      ).join('');
      sw.addEventListener('change', () => { setActiveClassId(sw.value); location.reload(); });
    }
  }

  await refreshNotifBadge(teacher.uid);

  return { teacher, accessibleClasses, classId };
}

export async function refreshNotifBadge(teacherUid){
  const badge = $('navNotifBadge');
  if (!badge) return;
  try {
    const q = query(collection(dbx, 'notifications'), where('teacherUid', '==', teacherUid), where('read', '==', false));
    const snap = await getDocs(q);
    badge.textContent = snap.size;
    badge.classList.toggle('hidden', !snap.size);
  } catch (e) { /* silent — badge just stays hidden */ }
}
