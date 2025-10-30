const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

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
  // Read subscribers
  const subscribersFile = path.resolve(__dirname, '../subscribers.json');
  if (!fs.existsSync(subscribersFile)) {
    return res.status(400).json({ error: 'Chưa có ai đăng ký!' });
  }
  let list;
  try {
    list = JSON.parse(fs.readFileSync(subscribersFile, 'utf8'));
  } catch (e) {
    return res.status(500).json({ error: 'Lỗi đọc subscribers' });
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
