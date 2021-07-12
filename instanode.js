'use strict';

const { instafeed, refreshToken } = require('instafeed-node-js');
const path = require('path');
const sharp = require('sharp');
const download = require('./fetchimage');
require('dotenv').config();
let fs = require('fs');
let fsp = fs.promises;

//Set the paths from the environment variables.
if(!process.env.IG_IMAGEINPUT_DIR || !process.env.IG_IMAGEOUTPUT_DIR || !process.env.IG_JSON_DIR || !process.env.IG_JSON_FILE){
    throw new Error('Please make sure to set the path variables in your .env file');
}

let rawPath = path.join('./', process.env.IG_IMAGEINPUT_DIR);
let thumbPath = path.join('./', process.env.IG_IMAGEOUTPUT_DIR);
let jsonPath = path.join('./', process.env.IG_JSON_DIR);
let jsonFile = path.join('./', process.env.IG_JSON_DIR, process.env.IG_JSON_FILE);

async function downloadFeed(num = 25){
   try{
        let instagram_posts = await downloadPosts(num);
        await checkDirectories();
        await writeJsonFile(instagram_posts); 
        await downloadImages(instagram_posts);
        await generateThumbnails();
        await refreshInstagramToken();
        console.log('COMPLETED SUCCESSFULLY');
    }catch(e){
        console.error(e);
    }
};



async function writeJsonFile(instaPosts){
    await fsp.writeFile(jsonFile, JSON.stringify(instaPosts), (err) => {
        if (err) {
        throw new Error(err);
        //return
        }
        //file written successfully
    });
    console.log('JSON File written successfully at ' + jsonFile);
}


async function downloadPosts(num = 25){
    try{
        //Download the Instagram posts
        let response = await instafeed({
            access_token: process.env.ig_user_access_token,
            requestedCount: num
        });
        return response.data;
    }catch(e){
        throw new Error(e);
    }
}


async function checkDirectories(){
//create the directories if they don't exist
    await fsp.mkdir(rawPath, { recursive: true });
    await fsp.mkdir(thumbPath, { recursive: true});
    await fsp.mkdir(jsonPath, { recursive: true });
}


async function refreshInstagramToken(){
    let response = await refreshToken({access_token: process.env.ig_user_access_token});
    console.log('INSTAGRAM TOKEN REFRESHED... Now expires in ' + (response.expires_in / 60 / 60 / 24) + ' days.');
}


async function generateThumbnails(){
    //NOW GENERATE THE THUMBNAILS
    let files = await fsp.readdir(rawPath);
    console.log('GENERATING THUMBNAILS...');
    
    /*
    await files.forEach(async (file) => {
        await generateThumb(rawPath, file, thumbPath);
    });
    */
    for(let f = 0; f < files.length; f++){
        await generateThumb(rawPath, files[f], thumbPath);
    }
    console.log('ALL THUMBNAILS GENERATED');
}


async function generateThumb(inputpath, filename, outputpath){
    
    //Default image quality
    let jpegQuality = 55;

    //Use the env var for image quality if it's a valid number
    if(process.env.IG_IMAGE_QUALITY && (!Number.isNaN(Number(process.env.IG_IMAGE_QUALITY)))){
        jpegQuality = Number(process.env.IG_IMAGE_QUALITY);
    }    

    let inSize = ((await fsp.stat(inputpath + filename)).size / 1024).toFixed(0);
    
    await sharp(inputpath + filename)
        .resize(500)
        .jpeg({ quality: jpegQuality })
        .toFile(outputpath + filename)
        .catch((err) => console.log(err));
    
    let outSize = ((await fsp.stat(outputpath + filename)).size / 1024).toFixed(0);
    console.log(`  Generated JPG thumbnail (${inSize}kb => ${outSize}kb) (at quality ` + jpegQuality + ': ' + filename + ')');    
    
    let { name } = path.parse(filename);

    let webpFile = name + '.webp';
    await sharp(inputpath + filename)
        .resize(500)
        .webp({ quality: jpegQuality })
        .toFile(outputpath + webpFile)
        .catch((err) => console.log(err)) ;
    

    let webpOutSize = ((await fsp.stat(outputpath + webpFile)).size / 1024).toFixed(0);
    console.log(`  Generated WEBP thumbnail (${inSize}kb => ${webpOutSize}kb) (at quality ` + jpegQuality + ': ' + webpFile + ')');
}


async function downloadImages(instaPosts){
     //NOW DOWNLOAD ALL THE IMAGES   
     let imagesArray = [];
     console.log('DOWNLOADING IMAGES...');
     instaPosts.forEach((post, index) => {
         imagesArray.push(new Promise(
             async (resolve, reject) => {
                 let msg = await download(post.image, rawPath + post.id + '.jpg');
                 console.log('  ' + msg);
                 resolve();
             }
         ));
     });
     await Promise.allSettled(imagesArray);
     console.log('ALL IMAGES DOWNLOADED...');
}

module.exports = downloadFeed;