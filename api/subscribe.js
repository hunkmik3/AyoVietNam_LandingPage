const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, phone } = req.body || {};

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Thiếu thông tin: name, email, phone' });
    }

    const {
      SMTP_USER,
      SMTP_PASS,
      FROM_EMAIL,
      ADMIN_EMAIL,
      LEADS_WEBHOOK_URL
    } = process.env;

    if (!SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
      return res.status(500).json({ error: 'Chưa cấu hình SMTP_USER, SMTP_PASS hoặc FROM_EMAIL' });
    }

    // Hàm gửi mail qua SMTP AUTH dùng nodemailer
    const mailer = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    async function sendSMTPMail({from, to, subject, html}) {
      try {
        const info = await mailer.sendMail({
          from: `AYO Vietnam <${from}>`,
          to,
          subject,
          html
        });
        return info;
      } catch (err) {
        throw new Error('SMTP send error: ' + String(err && err.message || err));
      }
    }

    // Email xác nhận cho người đăng ký
    const customerMail = {
      from: FROM_EMAIL,
      to: email,
      subject: 'AYO Vietnam – Đăng ký thành công',
      html: `
        <div style="font-family:Montserrat,Arial,sans-serif;color:#111">
          <h2>Chào ${escapeHtml(name)},</h2>
          <p>Cảm ơn bạn đã đăng ký nhận thông tin từ <b>AYO Vietnam</b> 🎉</p>
          <p>Chúng tôi sẽ gửi cho bạn những cập nhật mới nhất và thông báo về địa điểm quay gần nhất để bạn có thể tham gia.</p>
          <p><b>Thông tin của bạn</b><br/>
          Họ tên: ${escapeHtml(name)}<br/>
          Email: ${escapeHtml(email)}<br/>
          SĐT: ${escapeHtml(phone)}</p>
          <p>Nếu đây không phải bạn, vui lòng bỏ qua email này.</p>
          <hr/>
          <p>Trân trọng,<br/>Đội ngũ AYO Vietnam</p>
        </div>
      `
    };

    // Email thông báo cho admin
    const adminTarget = ADMIN_EMAIL || FROM_EMAIL;
    const adminMail = {
      from: FROM_EMAIL,
      to: adminTarget,
      subject: '[AYO] Có đăng ký mới từ landing page',
      html: `
        <div style="font-family:Montserrat,Arial,sans-serif;color:#111">
          <h3>Đăng ký mới</h3>
          <p><b>Họ tên:</b> ${escapeHtml(name)}<br/>
          <b>Email:</b> ${escapeHtml(email)}<br/>
          <b>SĐT:</b> ${escapeHtml(phone)}<br/>
          <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}</p>
        </div>
      `
    };

    // Gửi cả hai email (song song)
    await Promise.all([
      sendSMTPMail(customerMail),
      sendSMTPMail(adminMail)
    ]);

    // Sau khi gửi mail thành công, lưu vào subscribers.json (ghi /tmp nếu trên Vercel)
    try {
      const fs = require('fs');
      const path = require('path');
      const subscribersFile = process.env.VERCEL === '1'
        ? '/tmp/subscribers.json'
        : path.resolve(__dirname, '../subscribers.json');
      let list = [];
      if (fs.existsSync(subscribersFile)) {
        try {
          list = JSON.parse(fs.readFileSync(subscribersFile, 'utf8'));
        } catch (e) { list = []; }
      }
      // Chỉ thêm nếu chưa có email này (tránh duplicate)
      if (!list.find(item => item.email === email)) {
        list.push({
          name,
          email,
          phone,
          createdAt: new Date().toISOString()
        });
        fs.writeFileSync(subscribersFile, JSON.stringify(list, null, 2));
      }
    } catch (e) {
      // Không chặn đăng ký nếu chỉ lỗi ghi log
      console.error('SAVE SUBSCRIBER ERROR:', e);
    }

    // Gọi webhook lưu lead (tuỳ chọn)
    if (LEADS_WEBHOOK_URL) {
      try {
        await fetch(LEADS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, source: 'ayo-landing-api', ts: new Date().toISOString() })
        });
      } catch (_) {}
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('SMTP EMAIL ERROR:', err);
    return res.status(500).json({ error: 'Không gửi được email qua SMTP Brevo', details: String(err && err.message || err) });
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


