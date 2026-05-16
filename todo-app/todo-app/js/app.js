// ── STATE ──
let tasks = JSON.parse(localStorage.getItem('tf_tasks') || '[]');
let filter = 'all';
let editId = null;
let selectedPriority = 'medium';
let userName = localStorage.getItem('tf_username') || '';

// ── LOGIN ──
function handleLogin() {
  const input = document.getElementById('loginName');
  const error = document.getElementById('loginError');
  const name  = input.value.trim();

  if (!name) {
    error.classList.add('show');
    input.focus();
    return;
  }
  error.classList.remove('show');

  userName = name;
  localStorage.setItem('tf_username', name);

  // Hide login screen, show splash
  const loginScreen = document.getElementById('loginScreen');
  loginScreen.classList.add('hidden');
  setTimeout(() => { loginScreen.style.display = 'none'; showSplash(); }, 400);
}

// Allow pressing Enter on the login input
document.getElementById('loginName').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleLogin();
});

// ── LOGOUT ──
function handleLogout() {
  localStorage.removeItem('tf_username');
  userName = '';
  // Show login screen again
  const loginScreen = document.getElementById('loginScreen');
  loginScreen.style.display = 'flex';
  document.getElementById('loginName').value = '';
  document.getElementById('loginError').classList.remove('show');
  setTimeout(() => loginScreen.classList.remove('hidden'), 10);
  // Hide main app screens
  document.getElementById('homeScreen').classList.remove('active');
  document.getElementById('aboutScreen').classList.remove('active');
  switchTab('home'); // reset tab state for next login
}

// ── SPLASH ──
function showSplash() {
  const splash = document.getElementById('splash');
  splash.style.display = 'flex';
  splash.classList.remove('hidden');
  applyUserName();

  setTimeout(() => {
    splash.classList.add('hidden');
    setTimeout(() => { splash.style.display = 'none'; }, 500);
    document.getElementById('homeScreen').classList.add('active');
    renderTasks();
  }, 1500);
}

// ── APPLY NAME TO HEADER ──
function applyUserName() {
  const name   = userName || 'User';
  const initials = name.charAt(0).toUpperCase();
  document.getElementById('headerName').textContent = 'Hello, ' + name + '!';
  document.getElementById('headerAvatar').textContent = initials;
}

// ── ON PAGE LOAD: check if already logged in ──
window.addEventListener('load', () => {
  if (userName) {
    // Already logged in — hide login, go straight to splash
    const loginScreen = document.getElementById('loginScreen');
    loginScreen.style.display = 'none';
    showSplash();
  } else {
    // Show login screen, keep home hidden
    document.getElementById('homeScreen').classList.remove('active');
    document.getElementById('loginName').focus();
  }
});

// ── SAVE TO LOCAL STORAGE ──
function save() {
  localStorage.setItem('tf_tasks', JSON.stringify(tasks));
}

// ── RENDER TASKS ──
function renderTasks() {
  const q = document.getElementById('searchInput').value.toLowerCase();

  let list = tasks.filter(t => {
    if (q && !t.title.toLowerCase().includes(q) && !t.desc.toLowerCase().includes(q)) return false;
    if (filter === 'active')    return !t.done;
    if (filter === 'completed') return t.done;
    if (filter === 'high')      return t.priority === 'high';
    if (filter === 'medium')    return t.priority === 'medium';
    if (filter === 'low')       return t.priority === 'low';
    return true;
  });

  const el = document.getElementById('tasksList');
  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><span class="emoji">📋</span><p>No tasks here yet.<br>Tap + to add one!</p></div>`;
  } else {
    el.innerHTML = list.map(t => taskHTML(t)).join('');
  }

  document.getElementById('totalCount').textContent   = tasks.length;
  document.getElementById('pendingCount').textContent = tasks.filter(t => !t.done).length;
  document.getElementById('doneCount').textContent    = tasks.filter(t => t.done).length;
}

// ── BUILD TASK CARD HTML ──
function taskHTML(t) {
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = t.due && t.due < today && !t.done;
  const dueLabel = t.due
    ? `<span class="due-label ${isOverdue ? 'overdue' : ''}">${isOverdue ? '⚠️ ' : '📅 '}${formatDate(t.due)}</span>`
    : '';

  return `
    <div class="task-card ${t.done ? 'completed' : ''}" id="tc_${t.id}">
      <button class="check-btn ${t.done ? 'done' : ''}" onclick="toggleDone('${t.id}')" title="Toggle complete"></button>
      <div class="task-body">
        <div class="task-title">${escHtml(t.title)}</div>
        ${t.desc ? `<div class="task-desc">${escHtml(t.desc)}</div>` : ''}
        <div class="task-meta">
          <span class="badge badge-${t.priority}">${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}</span>
          ${dueLabel}
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn" onclick="openEditSheet('${t.id}')" title="Edit">✏️</button>
        <button class="icon-btn del" onclick="deleteTask('${t.id}')" title="Delete">🗑️</button>
      </div>
    </div>`;
}

// ── HELPERS ──
function escHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m - 1]} ${+day}`;
}

// ── TASK ACTIONS ──
function toggleDone(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; save(); renderTasks(); }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.done);
  save();
  renderTasks();
}

function setFilter(f, btn) {
  filter = f;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

// ── BOTTOM SHEET — ADD ──
function openAddSheet() {
  editId = null;
  document.getElementById('sheetTitle').textContent = 'New Task';
  document.getElementById('inputTitle').value = '';
  document.getElementById('inputDesc').value  = '';
  document.getElementById('inputDate').value  = '';
  setPriority('medium');
  document.getElementById('sheetOverlay').classList.add('open');
  setTimeout(() => document.getElementById('inputTitle').focus(), 350);
}

// ── BOTTOM SHEET — EDIT ──
function openEditSheet(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  editId = id;
  document.getElementById('sheetTitle').textContent = 'Edit Task';
  document.getElementById('inputTitle').value = t.title;
  document.getElementById('inputDesc').value  = t.desc;
  document.getElementById('inputDate').value  = t.due || '';
  setPriority(t.priority);
  document.getElementById('sheetOverlay').classList.add('open');
  setTimeout(() => document.getElementById('inputTitle').focus(), 350);
}

// ── CLOSE SHEET ──
function closeSheet(e) {
  if (e && e.target !== document.getElementById('sheetOverlay')) return;
  document.getElementById('sheetOverlay').classList.remove('open');
}

document.getElementById('sheet').addEventListener('click', e => e.stopPropagation());

// ── SET PRIORITY ──
function setPriority(p) {
  selectedPriority = p;
  document.getElementById('ph').className = 'priority-pill' + (p === 'high'   ? ' sel-high'   : '');
  document.getElementById('pm').className = 'priority-pill' + (p === 'medium' ? ' sel-medium' : '');
  document.getElementById('pl').className = 'priority-pill' + (p === 'low'    ? ' sel-low'    : '');
}

// ── SAVE TASK (ADD OR EDIT) ──
function saveTask() {
  const title = document.getElementById('inputTitle').value.trim();
  if (!title) {
    document.getElementById('inputTitle').style.borderColor = '#C0392B';
    document.getElementById('inputTitle').focus();
    return;
  }
  document.getElementById('inputTitle').style.borderColor = '';

  const desc = document.getElementById('inputDesc').value.trim();
  const due  = document.getElementById('inputDate').value;

  if (editId) {
    const t = tasks.find(t => t.id === editId);
    if (t) {
      t.title    = title;
      t.desc     = desc;
      t.due      = due;
      t.priority = selectedPriority;
    }
  } else {
    tasks.unshift({
      id:       Date.now().toString(),
      title,
      desc,
      due,
      priority: selectedPriority,
      done:     false,
      created:  new Date().toISOString()
    });
  }

  save();
  renderTasks();
  document.getElementById('sheetOverlay').classList.remove('open');
}

// ── TAB SWITCH ──
function switchTab(tab) {
  document.getElementById('homeScreen').classList.toggle('active', tab === 'home');
  document.getElementById('aboutScreen').classList.toggle('active', tab === 'about');
  document.getElementById('navHome').classList.toggle('active', tab === 'home');
  document.getElementById('navAbout').classList.toggle('active', tab === 'about');
  document.getElementById('fab').style.display = tab === 'home' ? 'flex' : 'none';
}

// ── KEYBOARD SUBMIT ──
document.getElementById('inputTitle').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveTask();
});
