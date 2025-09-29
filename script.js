// Simple Note Keeper with localStorage
const titleEl = document.getElementById('title');
const contentEl = document.getElementById('content');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const notesContainer = document.getElementById('notes');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');

const STORAGE_KEY = 'notes_v1';
let notes = [];
let editId = null;

// load notes on startup
loadNotes();
renderNotes();

// Add / Update
saveBtn.addEventListener('click', () => {
  const title = titleEl.value.trim();
  const content = contentEl.value.trim();
  if (!content) {
    alert('Please write some content for the note.');
    return;
  }

  if (editId) {
    // update existing
    const idx = notes.findIndex(n => n.id === editId);
    if (idx !== -1) {
      notes[idx].title = title;
      notes[idx].content = content;
      notes[idx].updated = Date.now();
    }
    editId = null;
    saveBtn.textContent = 'Add Note';
  } else {
    // new note
    const note = {
      id: 'n_' + Date.now() + '_' + Math.floor(Math.random()*999),
      title,
      content,
      created: Date.now(),
      updated: Date.now()
    };
    notes.unshift(note);
  }

  titleEl.value = '';
  contentEl.value = '';
  persist();
  renderNotes();
});

// Clear all
clearBtn.addEventListener('click', () => {
  if (!notes.length) return;
  if (!confirm('Delete all notes?')) return;
  notes = [];
  persist();
  renderNotes();
});

// Search & sort handlers
searchEl.addEventListener('input', renderNotes);
sortEl.addEventListener('change', renderNotes);

// Helpers
function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    notes = raw ? JSON.parse(raw) : [];
  } catch (e) {
    notes = [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function renderNotes() {
  const q = searchEl.value.trim().toLowerCase();
  let list = notes.slice();

  // sort
  if (sortEl.value === 'new') {
    list.sort((a,b) => b.created - a.created);
  } else {
    list.sort((a,b) => a.created - b.created);
  }

  // filter by search
  if (q) {
    list = list.filter(n => (n.title + ' ' + n.content).toLowerCase().includes(q));
  }

  notesContainer.innerHTML = '';
  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No notes found. Add one above ✍️';
    notesContainer.appendChild(empty);
    return;
  }

  list.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const date = new Date(note.updated || note.created);
    meta.textContent = date.toLocaleString();

    const h3 = document.createElement('h3');
    h3.textContent = note.title || 'Untitled';

    const p = document.createElement('p');
    p.textContent = note.content;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(note.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'action-btn danger';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => {
      if (!confirm('Delete this note?')) return;
      notes = notes.filter(n => n.id !== note.id);
      persist();
      renderNotes();
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    card.appendChild(meta);
    card.appendChild(h3);
    card.appendChild(p);
    card.appendChild(actions);

    notesContainer.appendChild(card);
  });
}

function startEdit(id) {
  const n = notes.find(x => x.id === id);
  if (!n) return;
  titleEl.value = n.title;
  contentEl.value = n.content;
  editId = id;
  saveBtn.textContent = 'Update Note';
  contentEl.focus();
}
