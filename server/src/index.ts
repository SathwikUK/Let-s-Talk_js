import express from 'express'
import cors from 'cors'

import authRoute from './routes/auth'
const app=express()
app.use(express.json())
app.use(cors())

app.use("/auth",authRoute);

const PORT=5001;
app.listen(PORT,()=>{
   console.log(`server is running on port ${PORT}`) 
});