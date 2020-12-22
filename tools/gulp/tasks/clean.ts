import * as deleteEmpty from 'delete-empty';
import { series, src, task } from 'gulp';
import * as clean from 'gulp-clean';

import {
  misc,
  source
} from '../config';


function cleanOutput(): NodeJS.ReadWriteStream {
  const srcMisc = misc.map((item) => `${source}/${item}`);

  return src(
    [
      `${source}/**/*.js`,
      `${source}/**/*.d.ts`,
      ...srcMisc,
    ],
    {
      read: false,
    }
  ).pipe(clean());
};

function cleanDirs(done: () => void) {
  deleteEmpty.sync(`${source}/`);
  done();
}

task('clean:output', cleanOutput);
task('clean:dirs', cleanDirs);
task('clean:bundle', series('clean:output', 'clean:dirs'));
