const fs = require('fs'),
  path = require('path'),
  http = require('http');

const MIME = {
  '.css': 'text/css',
  '.js': 'application/javascript'
};

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

function validateFiles(pathnames, callback) {
  (function next(i, len) {
    if (i < len) {
      fs.stat(pathnames[i], function(err, stats) {
        if (err) {
          callback(err);
        } else if (!stats.isFile) {
          callback(new Error());
        } else {
          next(i + 1, len);
        }
      });
    } else {
      callback(null, pathnames);
    }
  })(0, pathnames.length);
}

function outputFiles(pathnames, writer) {
  (function next(i, len) {
    if (i < len) {
      let reader = fs.createReadStream(pathnames[i]);
      reader.pipe(writer, {end: false});
      reader.on('end', function() {
        next(i + 1, len);
      });
    } else {
      writer.end();
    }
  })(0, pathnames.length);
}

function main(argv) {
  const config = JSON.parse(fs.readFileSync(argv[0], 'utf-8')),
    root = config.root || '.',
    port = config.port || '80';

  let server = http.createServer(function(request, response) {
    let urlInfo = parseURL(root, request.url);

    validateFiles(urlInfo.pathnames, function(err, pathnames) {
      if (err) {
        response.writeHead(404);
        response.end(err.message);
      } else {
        response.writeHead(200, {
          'Content-Type': urlInfo.mime
        });
        outputFiles(pathnames, response);
      }
    });
  }).listen(port);

  process.on('SIGTERM', function() {
    server.close(function() {
      process.exit();
    });
  });
}

console.log('请访问 http://127.0.0.1/js??a.js,b.js');

main(process.argv.slice(2));