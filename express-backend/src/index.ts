import express from 'express';
import { createClient } from 'redis';

const app = express();
app.use(express.json());
//default redis port is 6379 which is port-binded to localhost port 6379 using docker, so we can omit the connection URL  
const redisClient = createClient();
redisClient.on('error', (err) => console.error('Redis Client Error', err));


app.post("/submit", async (req, res) => {
  const { problemId, code, language } = req.body;
  try{
    await redisClient.lPush('submissions', JSON.stringify({ problemId, code, language }));
    //store submission in the database
    res.json({ message: 'Submission received' });
  }
  catch(err){
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function startServer() {  
  try {
    app.listen(3000, () => {
    console.log('Server is running on port 3000');
    });
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis', err);
    process.exit(1);
  } 
}

startServer();