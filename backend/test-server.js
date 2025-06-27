const express = require('express');

const app = express();
const PORT = 3001;

app.get('/test', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});

// Keep process alive
setInterval(() => {
  console.log('Server is alive...');
}, 5000); 