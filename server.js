import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the main server logic
import { createServer } from './index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Create and setup the server
const server = await createServer(app);

// For production, serve the static client files
app.use(express.static(path.join(__dirname, 'client')));

// Send all non-API routes to the client app
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
  }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`TowAgent server running at http://0.0.0.0:${PORT}`);
});
