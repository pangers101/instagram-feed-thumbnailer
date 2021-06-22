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
            throw new Error(err);
        });
    });
};

//USAGE
// (async () => { 
//     let res = await download('https://www.####.com/test.jpg');
//     console.log(res);
// })();

module.exports = download;


