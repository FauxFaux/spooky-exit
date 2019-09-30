const cp = require('child_process');
const pMap = require('p-map');

async function callGit(cwd, command, idx) {
  idx = (idx.toString().padStart(2)) + ' '.repeat(idx * 2);

  console.log(idx, '1e');

  const child = cp.spawn('/usr/bin/git', command, {
    stdio: ['ignore', 'pipe', 'inherit'],
    cwd,
  });

  console.log(idx, '2s');

  const exit = new Promise((resolve, reject) => {
    console.log(idx, '3p');

    child.once('exit', (code) => {
      console.log(idx, '7x');

      if (0 === code) {
        resolve();
      } else {
        reject(`exit code: ${code} running ${command} in ${cwd}`);
      }
    });
    child.once('error', (err) => {
      console.log(idx, '7r');
      reject(err);
    });

    console.log(idx, "4d");
  });

  console.log(idx, "5b");

  let buf = '';
  for await (const chunk of child.stdout) {
    const text = chunk.toString('utf-8');
    buf += text;
  }

  console.log(idx, '6c');

  await exit;

  console.log(idx, '8a');

  return buf;
}

async function main() {
  const jobs = [];
  for (let i = 0; i < 24; ++i) {
    jobs.push(['ls-files']);
  }

  await pMap(jobs, (job, idx) => callGit(".", job, idx), {concurrency: 12});
}

main()
  .then(() => console.log('clean exit'))
  .catch((e) => console.log('bad exit', e));
