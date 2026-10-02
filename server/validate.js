const STATUSES = ['want', 'reading', 'read'];

/**
 * ตรวจและทำความสะอาดข้อมูลหนังสือ
 * @param {object} body ข้อมูลที่ client ส่งมา
 * @param {boolean} partial true = ใช้กับ PATCH (ไม่บังคับครบทุก field)
 * @returns {{errors: string[], data: object}}
 */
function validateBook(body = {}, partial = false) {
  const errors = [];
  const data = {};

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) errors.push('title is required');
    else data.title = body.title.trim();
  }
  if (!partial || body.author !== undefined) {
    if (typeof body.author !== 'string' || !body.author.trim()) errors.push('author is required');
    else data.author = body.author.trim();
  }
  if (body.category !== undefined) {
    if (typeof body.category !== 'string') errors.push('category must be a string');
    else data.category = body.category.trim();
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) errors.push(`status must be one of: ${STATUSES.join(', ')}`);
    else data.status = body.status;
  }
  if (body.rating !== undefined) {
    const r = Number(body.rating);
    if (!Number.isInteger(r) || r < 0 || r > 5) errors.push('rating must be an integer 0-5');
    else data.rating = r;
  }
  return { errors, data };
}

module.exports = { validateBook, STATUSES };
