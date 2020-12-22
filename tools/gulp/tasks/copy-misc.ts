import {
  dest,
  src,
  task
} from 'gulp';
import {
  misc,
  source
} from '../config';


function copyMisc(): NodeJS.ReadWriteStream {
  return src(misc)
  .pipe(dest(source));
}

task(`copy-misc`, copyMisc);