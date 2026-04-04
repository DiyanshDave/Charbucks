const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// listen on all network interfaces not just localhost
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Access from other devices: http://YOUR_IP:${PORT}`);
});