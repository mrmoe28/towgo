import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the main server logic
import { createServer } from './index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Create and setup the server
const server = await createServer(app);

// Determine the client directory path (works for both dev and production)
const clientDir = fs.existsSync(path.join(__dirname, 'dist')) 
  ? path.join(__dirname, 'dist') 
  : path.join(__dirname, 'client');

const indexFile = fs.existsSync(path.join(clientDir, 'index.html'))
  ? path.join(clientDir, 'index.html')
  : path.join(clientDir, 'client/index.html');

console.log(`Serving static files from: ${clientDir}`);
console.log(`Using index file: ${indexFile}`);

// For production, serve the static client files
app.use(express.static(clientDir));

// Special handling for assets in Vercel environment
if (process.env.VERCEL) {
  app.use('/assets', express.static(path.join(clientDir, 'assets')));
  app.use('/client/assets', express.static(path.join(clientDir, 'assets')));
}

// Send all non-API routes to the client app
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(indexFile);
  }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`TowAgent server running at http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.VERCEL) {
    console.log('Running in Vercel environment');
  }
});
