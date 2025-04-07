const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Route for the download page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'download.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Download server running at http://0.0.0.0:${PORT}`);
});
