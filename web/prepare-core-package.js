const fs = require('fs');
const path = require('path');

let rawdata = fs.readFileSync('package.json');
let package = JSON.parse(rawdata);
package.name = 'imjoy-core';
package.description = 'The core library for ImJoy -- a sandboxed plugin framework for computational web applications.';
package.dependencies = {};
package.devDependencies = {};
delete package.eslintConfig;
delete package.prettier;
delete package.postcss;
delete package.browserslist;
package.scripts = {};

const package_dir = 'dist/imjoy-core'

if (!fs.existsSync(package_dir)){
    fs.mkdirSync(package_dir);
}

fs.writeFileSync(path.join(package_dir, 'package.json'), JSON.stringify(package, null, 1));
fs.createReadStream('dist/imjoy-core.module.js').pipe(fs.createWriteStream(path.join(package_dir, 'index.js')));