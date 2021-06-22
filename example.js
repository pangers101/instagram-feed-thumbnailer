require('dotenv').config();

//Change require('./index') to require('instagram-feed-thumbnailer') in main project
let downloadFeed = require('./index');
downloadFeed(25);