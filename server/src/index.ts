import express, { Request, Response } from 'express';
import approuter from './routes';
import dotenv from 'dotenv';
// Create an instance of Express
const app = express();
dotenv.config();

// Middleware to parse JSON
app.use(express.json());

// Define a basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running!');
});
app.use('/api', approuter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});