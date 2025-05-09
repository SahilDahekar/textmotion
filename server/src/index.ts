import express, { Request, Response } from 'express';

// Create an instance of Express
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Define a basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World 2!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});