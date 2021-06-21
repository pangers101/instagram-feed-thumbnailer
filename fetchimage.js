var fs = require('fs');
let req = require('request');

var download = function(uri, filename, callback = ''){
    return new Promise((resolve, reject) => {
        req.head(uri, function(err, res, body){
            //console.log('content-type:', res.headers['content-type']);
            //console.log('content-length:', res.headers['content-length']);
            console.log('writing image ' + filename);
            req(uri).pipe(fs.createWriteStream(filename)).on('close', () => { resolve(`Downloaded ${filename}`); });
        });
    });
};

//download('https://scontent-lcy1-1.cdninstagram.com/v/t51.29350-15/189840100_310028870585958_1174287797216649195_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=8ae9d6&_nc_ohc=3LPvTdKm0lQAX9nFaIE&_nc_ht=scontent-lcy1-1.cdninstagram.com&oh=614d6c82dbbe2dd1dc6ee7abb5ca40d3&oe=60D626A4',
//'atest.jpg', (ev) => console.log(ev) );

module.exports = download;


