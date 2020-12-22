import { dest, task } from 'gulp';
import { createProject } from 'gulp-typescript';

import { source } from '../config';


const project = createProject(`${source}/tsconfig.json`);

function build(): NodeJS.ReadWriteStream {
  return project
    .src()
    .pipe(project())
    .pipe(dest(`${source}`))
}

task(`build`, build);