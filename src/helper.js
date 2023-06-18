const path = require('path');
const fs = require('fs');
const fsPromise = require('fs/promises');
const HLS = require('hls-parser');      
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

const videoFilePath = path.resolve(__dirname, '../assets/video/relaxation.mp4')
const shotsFilePath = path.resolve(__dirname, '../assets/static/shot_%03d.jpg')
const outputFileName = 'relaxation.m3u8'; 
const m3u8FilePath = path.resolve(__dirname, '../assets/hls/relaxation.m3u8');
const h3u8FilePath = path.resolve(__dirname, '../assets/h3u8/relaxation.h3u8');

 function converter(){
    return new Promise((res, rej) => {
        ffmpeg(videoFilePath)
            .addOption('-c:v', 'libx264')
            .addOption('-c:a', 'aac')
            .addOption('-flags', '-global_header')
            .addOption('-hls_time', '10')
            .addOption('-hls_list_size', '0')
            .output(m3u8FilePath)
            .on('end', () => {
                console.log('Конвертация завершена');
                res(outputFileName);
            })
            .on('error', (error) => {
                console.error('Произошла ошибка при конвертации:', error);
                rej(error);
            })
            .run();
    })
}
function fromM3u8ToH3u8(){
    try {
        const content = fs.readFileSync(m3u8FilePath, 'utf-8');
        const playlist = HLS.parse(content);
        const h3u8Content = HLS.stringify(playlist)
        fs.writeFileSync(h3u8FilePath, h3u8Content)
    } catch (error) {
        console.log(`Error while m3u8 convert: ${error}`);
    }
}

function shotsFromVideo(){
    const interval = 15; 

    ffmpeg(videoFilePath)
    .outputOptions('-vf', `fps=1/${interval}`)
    .output(shotsFilePath)
    .on('end', () => {
        console.log('Выделение кадров завершено!');
    })
    .on('error', (err) => {
        console.error('Ошибка при выделении кадров:', err);
    })
    .run();
}

function getPic(){
    const result = []
    const imageFolder = path.resolve(__dirname, '../assets/static')
    return new Promise(async (resolve, reject) => {
        const files = await fsPromise.readdir(imageFolder)
        for (let file of files){
            const shotPath = path.join(imageFolder, file)
            const data = await fsPromise.readFile(shotPath, { encoding: 'base64' })
            const shot = `data:image/png;base64,` + data
            result.push(shot)
        }
        resolve(result)
    })
}

module.exports = {
    converter: converter,
    fromM3u8ToH3u8: fromM3u8ToH3u8,
    shotsFromVideo: shotsFromVideo,
    getPic: getPic
};