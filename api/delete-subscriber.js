const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  const authHeader = req.headers.authorization || '';
  if (!ADMIN_SECRET || authHeader !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { email } = req.method === 'DELETE' ? req.query : req.body;
  if (!email) {
    return res.status(400).json({ error: 'Thiếu email' });
  }
  
  try {
    const { GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT } = process.env;
    if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT) {
      return res.status(500).json({ error: 'Chưa cấu hình Google Sheets' });
    }
    
    let credentials;
    try {
      credentials = typeof GOOGLE_SERVICE_ACCOUNT === 'string' 
        ? JSON.parse(GOOGLE_SERVICE_ACCOUNT) 
        : GOOGLE_SERVICE_ACCOUNT;
    } catch (parseErr) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT:', parseErr);
      return res.status(500).json({ error: 'Invalid credentials format' });
    }
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Đọc tất cả dữ liệu để tìm row index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'A2:D', // Bỏ qua header row
    });
    
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row && row[1] === email);
    
    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy subscriber với email này' });
    }
    
    // Row thực tế trong sheet = rowIndex + 2 (vì có header row + index bắt đầu từ 0)
    const actualRowNumber = rowIndex + 2;
    
    // Xóa dòng
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: GOOGLE_SHEET_ID,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Sheet đầu tiên
              dimension: 'ROWS',
              startIndex: actualRowNumber - 1, // Google Sheets API dùng 0-based index
              endIndex: actualRowNumber
            }
          }
        }]
      }
    });
    
    console.log(`Successfully deleted subscriber: ${email}`);
    res.json({ ok: true, message: 'Đã xóa subscriber thành công' });
  } catch (e) {
    console.error('DELETE SUBSCRIBER ERROR:', e);
    console.error('Error details:', e.message, e.stack);
    res.status(500).json({ error: String(e.message || e) });
  }
};

