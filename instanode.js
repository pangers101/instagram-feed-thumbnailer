'use strict';
require('dotenv').config();

const { instafeed, refreshToken } = require('instafeed-node-js');
const { path } = require('path');
const sharp = require('sharp');
const download = require('./fetchimage');
let fs = require('fs');
let fsp = fs.promises;

//let rawpath = 'src/images/instaimagesraw/';
let rawPath = process.env.IG_IMAGEINPUT_DIR;
let thumbPath = process.env.IG_IMAGEOUTPUT_DIR;
let jsonPath = process.env.IG_JSONFILE;
//let thumbpath = 'dist/images/instaimages/';

async function downloadFeed(){
    
    let response = await instafeed({
        access_token: process.env.ig_user_access_token
    });
    let instagram_posts = response.data;
    await fsp.writeFile(jsonPath, JSON.stringify(instagram_posts), (err) => {
        if (err) {
        console.error(err)
        return
        }
        //file written successfully
    });
    console.log('JSON File written successfully at ' + jsonPath);
    
    
    //NOW DOWNLOAD ALL THE IMAGES   
    let imagesArray = [];
    console.log('Downloading images...');
    instagram_posts.forEach((post, index) => {
        imagesArray.push(new Promise(
            async (resolve, reject) => {
                await download(post.image, rawPath + post.id + '.jpg');
                resolve();
            }
        ));
    });
    
    await Promise.allSettled(imagesArray);
    console.log('All images downloaded...');

    //NOW GENERATE THE THUMBNAILS
    let files = await fsp.readdir(rawPath);
    await files.forEach((file) => {
        generateThumbnail(rawPath, file, thumbPath);
    });

};

async function generateThumbnail(inputpath, filename, outputpath){
    await sharp(inputpath + filename)
        .resize(500)
        .toBuffer()
        .toFile(outputpath + filename)
        .catch((err) => console.log(err)) ;
    return Promise.resolve('Generated: ' + post.id + '.jpg');
}

module.exports = downloadFeed;