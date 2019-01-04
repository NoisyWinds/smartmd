const path = require("path");
const babel = require("rollup-plugin-babel");
const cjs = require("rollup-plugin-commonjs");
const replace = require("rollup-plugin-replace");
const resolve = require("rollup-plugin-node-resolve");
const flow = require("rollup-plugin-flow-no-whitespace");
const packages = require("../package.json");
const json = require("rollup-plugin-json");
const builtins = require("rollup-plugin-node-builtins");
const postcss = require("rollup-plugin-postcss");
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const version = process.env.VERSION || packages.version;


const banner =
  '/*!\n' +
  ` * Smartmd.js v${version}\n` +
  ` * (c) 2018-${new Date().getFullYear()} NoisyWinds\n` +
  ' * Released under the MIT License.\n' +
  ' */';

const builds = {
  'esm': {
    entry: path.resolve('src/index.js'),
    dest: path.resolve('dist/smartmd.esm.js'),
    format: 'es',
    env: 'production',
    banner
  },
  'cjs': {
    entry: path.resolve('src/index.js'),
    dest: path.resolve('dist/smartmd.common.js'),
    format: 'cjs',
    env: 'production',
    banner
  },
  'development': {
    entry: path.resolve('src/index.js'),
    dest: path.resolve('dist/smartmd.js'),
    format: 'umd',
    env: 'development',
    banner
  },
  'production': {
    entry: path.resolve('src/index.js'),
    dest: path.resolve('dist/smartmd.min.js'),
    format: 'umd',
    env: 'production',
    banner
  }
};

function genConfig(name) {

  const opts = builds[name];
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      resolve({
        extensions: [".js", ".ts"]
      }),
      postcss({
        extensions: [".css", ".scss"],
        use: ["sass"],
        plugins: [autoprefixer, cssnano],
        extract: "dist/smartmd.min.css"
      }),
      builtins(),
      cjs({
        include: "node_modules/**"
      }),
      flow(),
      babel({
        runtimeHelpers: true,
        exclude: "node_modules/**"
      }),
      json()
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'Smartmd'
    }
  };

  if (opts.env) {
    config.plugins.push(replace({
      'process.env.NODE_ENV': JSON.stringify(opts.env)
    }))
  }

  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  });

  return config
}

if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET)
} else {
  exports.getBuild = genConfig;
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}
