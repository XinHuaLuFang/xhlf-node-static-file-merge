const fs = require('fs'),
      path = require('path'),
      http = require('http');

const MIME = {
  '.css': 'text/css',
  '.js': 'application/javascript'
};

function combineFiles(pathnames, callback) {
  let output = [];

  (function next(i, len) {
    if (i < len) {
      fs.readFile(pathnames[i], function(err, data) {
        if (err) {
          callback(err);
        } else {
          output.push(data);
          next(i + 1, len);
        }
      });
    } else {
      callback(null, Buffer.concat(output));
    }
  })(0, pathnames.length);
}

function parseURL(root, url) {
  let base, pathnames, parts;

  if (url.indexOf('??') === -1) {
    url = url.replace('/', '/??');
  }
  parts = url.split('??');
  base = parts[0];
  pathnames = parts[1].split(',').map(function(item) {
    return path.join(root, base, item);
  });
  return {
    mime: MIME[path.extname(pathnames[0])] || 'text/plain',
    pathnames: pathnames
  }
}

function main(argv) {
  let config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
    root = config.root || '.',
    port = config.port || 80;

  http.createServer(function(request, response) {
    let urlInfo = parseURL(root, request.url);

    combineFiles(urlInfo.pathnames, function(err, data) {
      if (err) {
        response.writeHead(404);
        response.end(err.message);
      } else {
        response.writeHead(200, {
          'Content-Type': urlInfo.mime
        });
        response.end(data);
      }
    });
  }).listen(port);
}
console.log('请访问 http://127.0.0.1/js??a.js,b.js');

main(process.argv.slice(2));