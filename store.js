// เก็บข้อมูลลงไฟล์ JSON (ง่ายและไม่ต้องติดตั้งฐานข้อมูล)
const fs = require('fs');
const path = require('path');

const FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'books.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    return [];
  }
}

function save(books) {
  fs.writeFileSync(FILE, JSON.stringify(books, null, 2));
}

module.exports = { load, save };
