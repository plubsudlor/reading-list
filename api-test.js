// ทดสอบทุก endpoint แล้วแสดงตาราง status (ต้องรัน server ไว้ก่อน: npm run dev)
// ใช้: npm run test:api   (เปลี่ยน URL ได้ด้วย BASE=http://localhost:4000)
const BASE = process.env.BASE || 'http://localhost:3000';

async function call(method, path, body, rawBody) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: rawBody ?? (body ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  return { status: res.status, text };
}

(async () => {
  const rows = [];
  const check = async (label, expected, method, path, body, rawBody) => {
    const r = await call(method, path, body, rawBody);
    rows.push({
      '': r.status === expected ? '✅' : '❌',
      Test: label,
      Request: `${method} ${path}`,
      Expected: expected,
      Actual: r.status,
    });
    return r;
  };

  try {
    await check('ดึงรายการทั้งหมด', 200, 'GET', '/api/books');
    await check('กรองด้วย ?status=read', 200, 'GET', '/api/books?status=read');
    await check('ค้นหาด้วย ?q=clean', 200, 'GET', '/api/books?q=clean');
    await check('ดึงเล่มที่ 1', 200, 'GET', '/api/books/1');
    await check('ดึงเล่มที่ไม่มี (404)', 404, 'GET', '/api/books/99999');
    await check('เพิ่มโดยไม่มีชื่อ (400)', 400, 'POST', '/api/books', { author: 'No Title' });
    await check('เพิ่ม status ผิด (400)', 400, 'POST', '/api/books', { title: 'x', author: 'y', status: 'bad' });
    const created = await check('เพิ่มหนังสือสำเร็จ (201)', 201, 'POST', '/api/books',
      { title: 'API Test Book', author: 'Tester', category: 'Test' });
    const id = JSON.parse(created.text).id;
    await check('แก้ไขหนังสือ', 200, 'PATCH', `/api/books/${id}`, { status: 'read', rating: 5 });
    await check('แก้ rating ผิด (400)', 400, 'PATCH', `/api/books/${id}`, { rating: 9 });
    await check('แก้เล่มที่ไม่มี (404)', 404, 'PATCH', '/api/books/99999', { rating: 3 });
    await check('ลบหนังสือสำเร็จ (204)', 204, 'DELETE', `/api/books/${id}`);
    await check('ลบซ้ำ (404)', 404, 'DELETE', `/api/books/${id}`);
  } catch (e) {
    console.error(`เชื่อมต่อ ${BASE} ไม่ได้ — รัน "npm run dev" ไว้ก่อนหรือยัง?`);
    process.exit(1);
  }

  console.table(rows);
  const failed = rows.filter((r) => r[''] === '❌').length;
  console.log(failed ? `❌ ล้มเหลว ${failed} รายการ` : `✅ ผ่านทั้งหมด ${rows.length} รายการ`);
  process.exit(failed ? 1 : 0);
})();
