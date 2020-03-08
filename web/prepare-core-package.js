const fs = require('fs');
const path = require('path');

let rawdata = fs.readFileSync('package.json');
let pkg = JSON.parse(rawdata);
pkg.name = 'imjoy-core';
pkg.description = 'The core library for ImJoy -- a sandboxed plugin framework for computational web applications.';
pkg.dependencies = {};
pkg.devDependencies = {};
delete pkg.eslintConfig;
delete pkg.prettier;
delete pkg.postcss;
delete pkg.browserslist;
pkg.scripts = {};

const package_dir = 'dist/imjoy-core'

if (!fs.existsSync(package_dir)){
    fs.mkdirSync(package_dir);
}

fs.writeFileSync(path.join(package_dir, 'package.json'), JSON.stringify(pkg, null, 1));
fs.createReadStream('dist/imjoy-core.module.js').pipe(fs.createWriteStream(path.join(package_dir, 'index.js')));