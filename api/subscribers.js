const { google } = require('googleapis');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  const authHeader = req.headers.authorization || '';
  if (!ADMIN_SECRET || authHeader !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const { GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT } = process.env;
    if (!GOOGLE_SHEET_ID || !GOOGLE_SERVICE_ACCOUNT) {
      console.warn('Google Sheets not configured for subscribers API');
      return res.json({ count: 0, subscribers: [], error: 'Google Sheets not configured' });
    }
    
    let credentials;
    try {
      credentials = typeof GOOGLE_SERVICE_ACCOUNT === 'string' 
        ? JSON.parse(GOOGLE_SERVICE_ACCOUNT) 
        : GOOGLE_SERVICE_ACCOUNT;
    } catch (parseErr) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT:', parseErr);
      return res.status(500).json({ count: 0, subscribers: [], error: 'Invalid credentials format' });
    }
    
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
    const subscribers = rows
      .filter(row => row && row.length > 0 && row[1]) // Chỉ lấy rows có email
      .map((row) => ({
        name: row[0] || '',
        email: row[1] || '',
        phone: row[2] || '',
        createdAt: row[3] || new Date().toISOString()
      }));
    
    // Tính thống kê
    const stats = {
      total: subscribers.length,
      byDay: {},
      byWeek: {},
      last7Days: 0,
      last30Days: 0,
      today: 0
    };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);
    
    subscribers.forEach(sub => {
      const date = new Date(sub.createdAt);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Đếm theo ngày
      stats.byDay[dateStr] = (stats.byDay[dateStr] || 0) + 1;
      
      // Đếm theo tuần (năm-tuần)
      const weekNum = getWeekNumber(date);
      const weekKey = `${date.getFullYear()}-W${weekNum}`;
      stats.byWeek[weekKey] = (stats.byWeek[weekKey] || 0) + 1;
      
      // Đếm các khoảng thời gian
      if (date >= today) stats.today++;
      if (date >= last7Days) stats.last7Days++;
      if (date >= last30Days) stats.last30Days++;
    });
    
    console.log(`Successfully read ${subscribers.length} subscribers from Google Sheets`);
    res.json({ count: subscribers.length, subscribers, stats });
  } catch (e) {
    console.error('READ SUBSCRIBERS ERROR:', e);
    console.error('Error details:', e.message, e.stack);
    res.status(500).json({ count: 0, subscribers: [], stats: null, error: String(e.message || e) });
  }
};

// Hàm helper tính số tuần trong năm
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
