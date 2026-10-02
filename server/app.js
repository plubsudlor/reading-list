const express = require('express');
const path = require('path');
const store = require('./store');
const { validateBook } = require('./validate');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// GET /api/books  (กรองด้วย ?status= ?category= ?q=)
app.get('/api/books', (req, res) => {
  const { status, category, q } = req.query;
  let books = store.load();
  if (status) books = books.filter((b) => b.status === status);
  if (category) books = books.filter((b) => (b.category || '').toLowerCase() === String(category).toLowerCase());
  if (q) {
    const term = String(q).toLowerCase();
    books = books.filter((b) => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term));
  }
  res.json(books);
});

// GET /api/books/:id
app.get('/api/books/:id', (req, res) => {
  const book = store.load().find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// POST /api/books
app.post('/api/books', (req, res) => {
  const { errors, data } = validateBook(req.body, false);
  if (errors.length) return res.status(400).json({ errors });

  const books = store.load();
  const book = {
    id: books.reduce((max, b) => Math.max(max, b.id), 0) + 1,
    title: data.title,
    author: data.author,
    category: data.category || '',
    status: data.status || 'want',
    rating: data.rating || 0,
    createdAt: new Date().toISOString(),
  };
  books.push(book);
  store.save(books);
  res.status(201).json(book);
});

// PATCH /api/books/:id
app.patch('/api/books/:id', (req, res) => {
  const books = store.load();
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found' });

  const { errors, data } = validateBook(req.body, true);
  if (errors.length) return res.status(400).json({ errors });

  books[index] = { ...books[index], ...data };
  store.save(books);
  res.json(books[index]);
});

// DELETE /api/books/:id
app.delete('/api/books/:id', (req, res) => {
  const books = store.load();
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  books.splice(index, 1);
  store.save(books);
  res.status(204).end();
});

// JSON ที่พัง / error อื่น ๆ
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
