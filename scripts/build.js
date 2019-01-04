const terser = require('terser'),
  path = require('path'),
  fs = require('fs'),
  zlib = require('zlib'),
  rollup = require('rollup');

let builds = require('./config').getAllBuilds();


function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}

function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report(extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, (err) => {
      if (err) return reject(err);
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err);
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function buildEntry(config) {
  const output = config.output;
  const {file, banner} = output;
  const isProd = /min\.js$/.test(file);
  return rollup.rollup(config)
    .then((bundle) => bundle.generate(output))
    .then(({code}) => {
      if (isProd) {
        const minified = (banner ? banner + '\n' : '') + terser.minify(code, {
          output: {
            ascii_only: true
          },
          compress: {
            pure_funcs: ['makeMap']
          }
        }).code;
        return write(file, minified, true)
      }
      return write(file, code)

    })
}


function build(builds) {
  let ind = 0;
  const total = builds.length;
  const next = () => {
    buildEntry(builds[ind]).then(() => {
      ind++;
      if (ind < total) {
        next()
      }
    }).catch((e) => console.log(e))
  };
  next()
}

build(builds);
