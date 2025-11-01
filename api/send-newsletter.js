const nodemailer = require('nodemailer');
const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  const authHeader = req.headers.authorization || '';
  if (!ADMIN_SECRET || authHeader !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { subject, html } = req.body || {};
  if (!subject || !html) {
    return res.status(400).json({ error: 'Thiếu tiêu đề hoặc nội dung email' });
  }
  // SMTP config
  const { SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;
  if (!SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
    return res.status(500).json({ error: 'Chưa cấu hình SMTP_USER, SMTP_PASS hoặc FROM_EMAIL' });
  }
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  // Read subscribers from Google Sheets
  const { GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT } = process.env;
  if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT) {
    return res.status(400).json({ error: 'Chưa cấu hình Google Sheets!' });
  }
  
  let list = [];
  try {
    const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'A2:D', // Bỏ qua header row
    });
    
    const rows = response.data.values || [];
    list = rows.map(row => ({
      name: row[0] || '',
      email: row[1] || '',
      phone: row[2] || '',
      createdAt: row[3] || new Date().toISOString()
    }));
    
    if (list.length === 0) {
      return res.status(400).json({ error: 'Chưa có ai đăng ký!' });
    }
  } catch (e) {
    console.error('READ SUBSCRIBERS ERROR:', e);
    return res.status(500).json({ error: 'Lỗi đọc subscribers từ Google Sheets' });
  }
  
  let sent = 0, error = 0, errors = [];
  for (const user of list) {
    try {
      await transporter.sendMail({
        from: `AYO Vietnam <${FROM_EMAIL}>`,
        to: user.email,
        subject,
        html
      });
      sent++;
    } catch (e) {
      error++;
      errors.push({ email: user.email, message: String(e && e.message || e) });
    }
  }
  return res.json({ ok: true, sent, error, errors });
};
