// ============================================================
// Al-Haseeb Model Sec. School — Teacher Portal
// Shared Firebase init + helper functions, imported by every page.
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, addDoc, collection, query, where, getDocs, setDoc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});

export const app = initializeApp(window.FIREBASE_CONFIG);
export const auth = getAuth(app);
export const dbx = getFirestore(app);
export {
  doc, getDoc, addDoc, collection, query, where, getDocs, setDoc, updateDoc, serverTimestamp,
  signInWithEmailAndPassword, signOut, onAuthStateChanged
};

export const $ = id => document.getElementById(id);

export const ROLE_LABELS = {
  teacher: 'Class Teacher',
  admin_incharge: 'Admin Incharge',
  montessori_incharge: 'Montessori Incharge',
  primary_incharge: 'Primary Incharge',
  secondary_incharge: 'Secondary Incharge'
};

export function todayStr(){ return new Date().toISOString().slice(0,10); }

export function dayNameOf(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function initials(name){
  return (name || '').trim().split(/\s+/).slice(0,2).map(w => w[0] || '').join('').toUpperCase() || '?';
}

export function formatTime12h(t){
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h)) return '';
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = ((h % 12) || 12);
  return `${h12}:${String(m || 0).padStart(2,'0')} ${period}`;
}

export function monthLabelFromDate(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function daysInMonth(year, monthIndex){ return new Date(year, monthIndex + 1, 0).getDate(); }

// ---------------- Off Days (holidays marked by the admin) ----------------
export let offDaysMap = null;
export function isSundayStr(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  return !Number.isNaN(d.getTime()) && d.getDay() === 0;
}
export function isOffDateStr(dateStr){ return isSundayStr(dateStr) || !!(offDaysMap && offDaysMap[dateStr]); }
export function offLabelFor(dateStr){
  if (offDaysMap && offDaysMap[dateStr]) return offDaysMap[dateStr];
  if (isSundayStr(dateStr)) return 'Sunday — Off';
  return 'Off';
}
export async function ensureOffDaysLoaded(){
  if (offDaysMap !== null) return;
  try {
    const snap = await getDocs(collection(dbx, 'offDays'));
    offDaysMap = {};
    snap.docs.forEach(d => { offDaysMap[d.id] = (d.data().label || 'Off'); });
  } catch (e) { offDaysMap = {}; }
}

// ---------------- Auth guard ----------------
// Every page (except login.html) calls this first. Redirects to login.html
// if not signed in; otherwise resolves with { user, teacher }.
export function requireTeacherAuth(){
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) { location.href = 'login.html'; return; }
      let teacher = null;
      try {
        const snap = await getDoc(doc(dbx, 'teachers', user.uid));
        if (snap.exists()) {
          const t = snap.data();
          teacher = { uid: user.uid, name: t.name || '', role: t.role || 'teacher', classId: t.classId || null, staffId: t.staffId || null };
        }
      } catch (e) { /* leave teacher null — caller shows a friendly message */ }
      resolve({ user, teacher });
    });
  });
}

// ---------------- Class access (handles both single-class teachers and Incharge roles) ----------------
export async function getAccessibleClasses(teacher){
  if (teacher.role === 'teacher') {
    if (!teacher.classId) return [];
    try {
      const snap = await getDoc(doc(dbx, 'classes', teacher.classId));
      return [snap.exists() ? { id: teacher.classId, ...snap.data() } : { id: teacher.classId, className: '' }];
    } catch (e) { return [{ id: teacher.classId, className: '' }]; }
  }
  const category = teacher.role.replace('_incharge', '');
  const snap = teacher.role === 'admin_incharge'
    ? await getDocs(collection(dbx, 'classes'))
    : await getDocs(query(collection(dbx, 'classes'), where('category', '==', category)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.className || '').localeCompare(b.className || '', undefined, { numeric: true }));
}

// Remembers the Incharge's last-picked class for the rest of the browser session.
export function getActiveClassId(teacher, accessibleClasses){
  if (teacher.role === 'teacher') return teacher.classId || null;
  const saved = sessionStorage.getItem('hs_activeClassId');
  if (saved && accessibleClasses.some(c => c.id === saved)) return saved;
  return accessibleClasses[0] ? accessibleClasses[0].id : null;
}
export function setActiveClassId(id){ sessionStorage.setItem('hs_activeClassId', id); }
