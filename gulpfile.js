'use strict';

const path = require(`path`);
const tsNode = require(`ts-node`);

const projectDir = __dirname;
const tsConfigPath = path.resolve(projectDir, `./tools/gulp/tsconfig.json`);
tsNode.register({
  project: tsConfigPath,
});

require(`./tools/gulp/gulpfile`);