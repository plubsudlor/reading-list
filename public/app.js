// Frontend: เรียกเฉพาะ API ของตัวเอง (/api/books) ผ่าน fetch()
const API = '/api/books';
const STATUS_LABEL = { want: 'อยากอ่าน', reading: 'กำลังอ่าน', read: 'อ่านจบแล้ว' };

const $ = (id) => document.getElementById(id);
const form = $('book-form');
let currentStatus = '';
let books = [];

async function loadBooks() {
  const params = new URLSearchParams();
  if (currentStatus) params.set('status', currentStatus);
  const q = $('search').value.trim();
  if (q) params.set('q', q);
  try {
    const res = await fetch(`${API}?${params}`);
    books = await res.json();
    render();
  } catch {
    $('count').textContent = 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้';
  }
}

function render() {
  const list = $('book-list');
  list.replaceChildren();
  $('count').textContent = `พบ ${books.length} เล่ม`;

  if (!books.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'ยังไม่มีหนังสือในรายการ';
    list.append(li);
    return;
  }

  for (const b of books) {
    const li = document.createElement('li');
    li.className = 'book';

    const info = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = b.title;
    const meta = document.createElement('div');
    meta.className = 'meta';
    const badge = document.createElement('span');
    badge.className = `badge ${b.status}`;
    badge.textContent = STATUS_LABEL[b.status];
    const text = document.createElement('span');
    text.textContent = `${b.author}${b.category ? ' · ' + b.category : ''} `;
    const stars = document.createElement('span');
    stars.className = 'stars';
    stars.textContent = b.rating ? '★'.repeat(b.rating) + '☆'.repeat(5 - b.rating) : '';
    meta.append(badge, text, stars);
    info.append(h3, meta);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const edit = document.createElement('button');
    edit.className = 'btn small';
    edit.textContent = 'แก้ไข';
    edit.onclick = () => startEdit(b);
    const del = document.createElement('button');
    del.className = 'btn small danger';
    del.textContent = 'ลบ';
    del.onclick = () => removeBook(b);
    actions.append(edit, del);

    li.append(info, actions);
    list.append(li);
  }
}

function startEdit(b) {
  $('book-id').value = b.id;
  $('title').value = b.title;
  $('author').value = b.author;
  $('category').value = b.category || '';
  $('status').value = b.status;
  $('rating').value = b.rating;
  $('form-title').textContent = `แก้ไข: ${b.title}`;
  $('submit-btn').textContent = 'บันทึกการแก้ไข';
  $('cancel-btn').hidden = false;
  form.scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
  form.reset();
  $('book-id').value = '';
  $('form-error').textContent = '';
  $('form-title').textContent = 'เพิ่มหนังสือใหม่';
  $('submit-btn').textContent = 'เพิ่มหนังสือ';
  $('cancel-btn').hidden = true;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('book-id').value;
  const payload = {
    title: $('title').value,
    author: $('author').value,
    category: $('category').value,
    status: $('status').value,
    rating: Number($('rating').value),
  };
  const res = await fetch(id ? `${API}/${id}` : API, {
    method: id ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    $('form-error').textContent = (err.errors || [err.error]).join(', ');
    return;
  }
  resetForm();
  loadBooks();
});

async function removeBook(b) {
  if (!confirm(`ลบ "${b.title}" ใช่หรือไม่?`)) return;
  const res = await fetch(`${API}/${b.id}`, { method: 'DELETE' });
  if (res.status === 204) loadBooks();
}

$('cancel-btn').addEventListener('click', resetForm);
$('search').addEventListener('input', loadBooks);
$('filters').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
  chip.classList.add('active');
  currentStatus = chip.dataset.status;
  loadBooks();
});

loadBooks();
