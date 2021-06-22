var fs = require('fs');
let https = require('https');



//OLD FUNCTION USING THE REQUEST MODULE (NOW DEPRECATED)
/*
var download = function(uri, filename, callback = ''){
    return new Promise((resolve, reject) => {
        req.head(uri, function(err, res, body){
            //console.log('  Writing image ' + filename);
            req(uri).pipe(fs.createWriteStream(filename)).on('close', () => { resolve(`Downloaded ${filename}`); });
        });
    });
};
*/
var download = function(uri, filename, callback = () => {}){
    return new Promise((resolve, reject) => {
        var file = fs.createWriteStream(filename);
        var request = https.get(uri, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close();  // close() is async, call cb after close completes.
                resolve(`Downloaded ${filename}`);
            });
        }).on('error', function(err) { // Handle errors
            fs.unlink(file); // Delete the file async. (But we don't check the result)
            // if (cb){
            //     cb(err.message);
            // }else{
                throw new Error(err);
            //}
        });
    });
};

//USAGE
// (async () => { 
//     let res = await download('https://scontent.cdninstagram.com/v/t51.29350-15/175966488_130280339116544_2553575231065349854_n.jpg?_nc_cat=109&ccb=1-3&_nc_sid=8ae9d6&_nc_ohc=xkIV-3Tbz10AX-AN6KO&_nc_ht=scontent.cdninstagram.com&oh=546edd22bb5e827942dba248ccf7cb36&oe=60D7AF3C','test.jpg');
//     console.log(res);
// })();

module.exports = download;


