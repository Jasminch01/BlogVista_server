const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT | 5000;


//middlewares
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('blogVista server is runnig')
})


app.get('/helo', (req, res) => {
    res.send('hello world')
})

app.listen(PORT ,() => {
    console.log(`the blogVista server is runing port is ${PORT}`)
})