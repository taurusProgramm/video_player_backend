const express = require('express')
const cors = require('cors')
const path = require('path');
const fs = require('fs');
const {converter, fromM3u8ToH3u8, shotsFromVideo, getPic} = require('./helper.js')

const app = express()
const PORT = process.env.PORT || 5000;

const m3u8FilePath = path.resolve(__dirname, '../assets/hls/relaxation.m3u8');
const staticFiles = path.resolve(__dirname, '../assets/hls')

app.use(cors())
app.use('/video', express.static(staticFiles));

app.get('/video/relaxation.m3u8', async (req, res) => {
    try {
        
        fs.readFile(m3u8FilePath, 'utf-8', (err, data) => {
            if (err) {
              console.error('Ошибка чтения H3U8-файла:', err);
              return res.status(500).send('Ошибка сервера');
            }
            console.log('Обращение успешно, ответ ушел');
           
            res.set('Content-Type', 'application/vnd.apple.mpegurl');
            res.send(data);
          });
    } catch (error) {
        res.status(500).send('Произошла ошибка при конвертации видео');
    }
})

app.get('/', async (req,res) => {
    const data = await getPic()
    res.send(data)
})

app.listen(PORT, () =>{
    console.log(`Server was started on ${PORT} port` )
} )

