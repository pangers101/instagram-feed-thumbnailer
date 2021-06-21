
//let rawpath = process.env.IG_IMAGEINPUT_DIR;
//let thumbpath = process.env.IG_IMAGEOUTPUT_DIR;

require('dotenv').config();
let downloadFeed = require('./index');

//The num is optional
downloadFeed(25);