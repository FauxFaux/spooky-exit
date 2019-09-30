const cp = require('child_process');
const pMap = require('p-map');

async function callGit(cwd, command) {
  const child = cp.spawn('/usr/bin/git', command, {
    stdio: ['ignore', 'pipe', 'inherit'],
    cwd,
  });

  let buf = '';
  for await (const chunk of child.stdout) {
    const text = chunk.toString('utf-8');
    buf += text;
  }

  return new Promise((resolve, reject) => {
    child.once('exit', (code) => {
      if (0 === code) {
        resolve(buf);
      } else {
        reject(`exit code: ${code} running ${command} in ${cwd}`);
      }
    });
    child.once('error', (err) => reject(err));
  });
}

async function main() {
  const jobs = [];
  for (let i= 0; i < 100; ++i) {
    jobs.push(['ls-files']);
  }

  await pMap(jobs, (job) => callGit(".", job), { concurrency: 12 });
}

main()
  .then(() => console.log('clean exit'))
  .catch((e) => console.log('bad exit', e));
