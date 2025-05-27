import express, { Request, Response } from 'express';
import cors from 'cors';
import * as path from 'path';
import approuter from './routes';
import dotenv from 'dotenv';
// Create an instance of Express
const app = express();
dotenv.config();

const corsOptions = {
    origin: ['http://localhost:3000'],  // Both client origins
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

// Serve static files from public directory
if(process.env.NODE_ENV !== 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  console.log('Serving static files from:', publicPath);
  app.use(express.static(publicPath));
}

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