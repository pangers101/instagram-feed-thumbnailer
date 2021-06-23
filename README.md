# instagram-feed-thumbnailer

A Node JS package using the new Instagram feed API to pull in the latest Instagram posts from your authorised user, cache them and generate image thumbnails to save locally.

The package queries the Instagram API to get the latest posts of a user. This returns an object that references the image URL however by default these can be quite large in size (between 60kb and 650kb for the ones I've seen). If you were to dynamically load these into the browser then the page load time would suffer... badly. Also the Instagram API has rate limits, a max of 200 per hour - so it makes sense to cache the data.

This package downloads all the media files from the list of latest posts, generates thumbnails at a JPEG quality of your choice, and saves them into a directory that you can then make available to your Express server (or any other type of server). It does this using Node and tries to be as asynchronous as possible.

## Features

* Pull in a list of the latest posts from an Instagram account.
* Saves posts as a JSON file in your chosen directory.
* Downloads the raw post images from Instagram.
* Generate thumbnails and save locally.
* Currently console logs output (will soon integrate a proper logger).
* Resets the expiry date of the FB access token to +60 days.

## Installation & Usage

### 1. Obtain a Facebook Developer Access Token

For this package it uses the **Instagram Basic Display API**. Follow steps 1-3 on the [Getting Started](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started) page. Once you have a Facebook Developer account, you can then create a Facebook app, adding Instagram Basic Display to it. The next step is adding an Instagram Test user and accepting the invite from inside your Instagram account.

Then once you've accepted the tester invite, you can go back to the **Facebook Developer** dashboard: [https://developers.facebook.com/apps](https://developers.facebook.com/apps). Click on 'Instagram Basic Display' on the left-hand side, then click 'Basic Display', scroll down and there'll be a section titled **User Token Generator**.

Next to the relevant test user, click **Generate Token**. A popup then opens with the Instagram login authorisation window. Enter your login details here and then on the next page click 'Allow' to allow the app access. Once you've allowed this, the popup will close and back on the FB Developers page it will show your user access token.

This is a *long-lived user access token* and lasts for **60 days**, however whenever you run this npm package it **automatically refreshes the token**.

### 2. Install from NPM

Download through NPM: `npm install instagram-feed-thumbnailer`

### 3. Set up the .env file

Create a file called `.env` in the root of your main project containing the following:

```env
ig_user_access_token=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
IG_IMAGEINPUT_DIR=src/images/instaimagesraw/
IG_IMAGEOUTPUT_DIR=dist/images/instaimages/

#The output directory for the JSON file containing the latest posts.
IG_JSON_DIR=dist/js/
IG_JSON_FILE=instaposts.json

#You can set whatever JPEG quality here that balances your filesize / image quality needs.
IG_IMAGE_QUALITY=60
```

Obviously replace the *ig_user_access_token* with your long-lived token obtained before. 

**IMPORTANT:** Make sure to **keep this secret** and add this **.env** file to your `.gitignore` file. 

There are three directories specified here that you can change if necessary:

* IG_IMAGEINPUT_DIR=src/images/instaimagesraw/
* IG_IMAGEOUTPUT_DIR=dist/images/instaimages/
* IG_JSON_DIR=dist/js/    and also...
* IG_JSON_FILE=instaposts.json

### 4. Use in your package

You can run the feed generator manually by putting code such as this into your package:

```javascript
let downloadFeed = require('instagram-feed-thumbnailer');
//Change 25 to your required number of posts
downloadFeed(25);
```

Feel free to change the '25' to your required number of latest posts. Running `downloadFeed(25)` also refreshes your Facebook developer token once it has finished all of the image download and thumbnail generation.

### 5. Scheduling the feed

You can either run this manually each time you want to refresh the feed, or use a package such as [node-cron](https://www.npmjs.com/package/node-cron) to run the `downloadFeed(25)` function. Alternatively if you set a download script.

## Bugs and issues

Please feel free to report any issues / bugs through its [Github Repo](https://github.com/pangers101/instagram-feed-thumbnailer/issues).