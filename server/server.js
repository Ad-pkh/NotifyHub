import 'dotenv/config';
import http from 'http';
import { connectDb } from './src/lib/db.js';
import { verifyMailerConnection } from './src/lib/mailer.js';
import app from './app.js';

const port = process.env.PORT || 8000;

try {
  await connectDb();
} catch (err) {
  console.log('error while connecting DB!!!');
  console.log(err);
  process.exit(1);
}

try {
  await verifyMailerConnection();
  console.log('SMTP server verified successfully...');
} catch (err) {
  console.error('SMTP verification failed. Email delivery may not work.');
  console.error(err instanceof Error ? err.message : err);
}

const server = http.createServer(app);

server.listen(port, (error) => {
  if (error) {
    console.log('server error');
  }
  console.log(`Server is running on port ${port}`);
});
