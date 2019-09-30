const cp = require('child_process');
const pMap = require('p-map');

async function callGit(cwd, command, idx) {
  idx = idx + ' '.repeat(idx * 2);

  console.log(idx, '1e');

  const child = cp.spawn('/usr/bin/git', command, {
    stdio: ['ignore', 'pipe', 'inherit'],
    cwd,
  });

  console.log(idx, '2s');

  let buf = '';
  for await (const chunk of child.stdout) {
    const text = chunk.toString('utf-8');
    buf += text;
  }

  console.log(idx, '3c');

  return new Promise((resolve, reject) => {
    console.log(idx, '4p');

    child.once('exit', (code) => {
      console.log(idx, '6x');

      if (0 === code) {
        resolve(buf);
      } else {
        reject(`exit code: ${code} running ${command} in ${cwd}`);
      }
    });
    child.once('error', (err) => {
      console.log(idx, '6r');
      reject(err);
    });

    console.log(idx, "5d");
  });
}

async function main() {
  const jobs = [];
  for (let i = 0; i < 100; ++i) {
    jobs.push(['ls-files']);
  }

  await pMap(jobs, (job, idx) => callGit(".", job, idx), {concurrency: 4});
}

main()
  .then(() => console.log('clean exit'))
  .catch((e) => console.log('bad exit', e));
