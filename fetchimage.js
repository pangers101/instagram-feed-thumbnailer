var fs = require('fs');
let req = require('request');

var download = function(uri, filename, callback = ''){
    return new Promise((resolve, reject) => {
        req.head(uri, function(err, res, body){
            //console.log('  Writing image ' + filename);
            req(uri).pipe(fs.createWriteStream(filename)).on('close', () => { resolve(`Downloaded ${filename}`); });
        });
    });
};

module.exports = download;


