'use strict';
require('dotenv').config();

const { instafeed, refreshToken } = require('instafeed-node-js');
const path = require('path');
const sharp = require('sharp');
const download = require('./fetchimage');
let fs = require('fs');
let fsp = fs.promises;

//let rawpath = 'src/images/instaimagesraw/';
let rawPath = path.join(__dirname, process.env.IG_IMAGEINPUT_DIR);
let thumbPath = path.join(__dirname, process.env.IG_IMAGEOUTPUT_DIR);
let jsonPath = path.join(__dirname, process.env.IG_JSON_DIR);
let jsonFile = path.join(__dirname, process.env.IG_JSON_DIR, process.env.IG_JSON_FILE);
//let thumbpath = 'dist/images/instaimages/';
//console.log(rawPath + '\n' + thumbPath + '\n' + jsonPath + '\n' + jsonFile);
//return;
async function downloadFeed(num = 25){
    
    //Download the Instagram posts
    let response = await instafeed({
        access_token: process.env.ig_user_access_token,
        requestedCount: num
    });
    //console.log(response); return;
    let instagram_posts = response.data;

    //create the directories if they don't exist
    await fsp.mkdir(rawPath, { recursive: true });
    await fsp.mkdir(thumbPath, { recursive: true});
    await fsp.mkdir(jsonPath, { recursive: true });


    await fsp.writeFile(jsonFile, JSON.stringify(instagram_posts), (err) => {
        if (err) {
        throw new Error(err);
        //return
        }
        //file written successfully
    });
    console.log('JSON File written successfully at ' + jsonPath + jsonFile);
    
    
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
    
    //NOW REFRESH THE INSTAGRAM TOKEN
    refreshInstagramToken();
};

async function refreshInstagramToken(){
    let response = await refreshToken({access_token: process.env.ig_user_access_token});
    console.log('Instagram Token refreshed. Now expires in ' + (response.expires_in / 60 / 60 / 24) + ' days.');
    //console.log(response);
}

async function generateThumbnail(inputpath, filename, outputpath){
    await sharp(inputpath + filename)
        .resize(500)
        .toFile(outputpath + filename)
        .catch((err) => console.log(err)) ;
    return Promise.resolve('Generated: ' + filename);
}

module.exports = downloadFeed;