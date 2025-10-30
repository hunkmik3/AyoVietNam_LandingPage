const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  const authHeader = req.headers.authorization || '';
  if (!ADMIN_SECRET || authHeader !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const subscribersFile = process.env.VERCEL === '1'
    ? '/tmp/subscribers.json'
    : path.resolve(__dirname, '../subscribers.json');
  let list = [];
  if (fs.existsSync(subscribersFile)) {
    try {
      list = JSON.parse(fs.readFileSync(subscribersFile, 'utf8'));
    } catch (e) {
      list = [];
    }
  }
  res.json({ count: list.length, subscribers: list });
};
