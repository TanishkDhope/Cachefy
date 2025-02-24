import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const cache = new Map();

app.use(express.json());
app.use(cors());

// Get port and target URL from CLI args
const port = process.argv[2] || 8000;
const origin = process.argv[3]; 

if (!origin) {
  console.error("Error: No origin URL provided! Use --url <origin_url>");
  process.exit(1);
}


const storeInCache=async (cacheKey, response) => {
  cache.set(cacheKey, response);
}


// Middleware to check and return cached responses
const getCachedResponse = async (origin) => {
  const cacheKey = origin;
  try{
    if (cache.has(cacheKey)) {
      console.log("Cache HIT!", cacheKey);
      return cache.get(cacheKey);
    }
    else{
      console.log("Cache MISS!", cacheKey);
      const response = await axios.get(origin);
      const data=await response.data;
      storeInCache(cacheKey, data);
      return data;
    }
  }
  catch(err)
  {
    return err;
  }
};


const proxy=async (req,res, next)=>{
  const response=await getCachedResponse(`${origin}${req.path}`);
  res.send(response);
  next();
}

app.get("/clear",(req,res)=>{
  cache.clear();
  res.send("Cache Cleared!");
  
})

app.get('/*', proxy);



app.listen(port, () => {
  console.log(`Caching server is running on http://localhost:${port}, proxying to ${origin}`);
});
