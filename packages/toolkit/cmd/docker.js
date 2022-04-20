const childProcess = require('child_process');
const {info} = require("../src/log");


function run(
  command,
  runArgs,
  opts,
  options = {executable: "docker"}
) {
  return new Promise((resolve, reject) => {
    const cwd = options.cwd
    const env = options.env || undefined
    const executablePath = options.executable;

    const execParams = Object.keys(opts)
      .reduce((acc, k) => {
        if (opts[k] === '') {
          return [...acc, opts[k]];
        } else {

          return [...acc, k, opts[k]]
        }
      }, [])


    const cmd = Array.isArray(command) ? [...command] : [command]

    const execArgs = [
      ...cmd,
      ...execParams,
      ...runArgs
    ];

    info('Execute command: ', [executablePath, ...execArgs].join(' '));

    const childProc = childProcess.spawn(executablePath, execArgs, {
      cwd,
      env
    })

    const result = {
      exitCode: null,
      err: '',
      out: ''
    }


    childProc.on('error', (err) => {
      reject(err)
    });

    childProc.stdout.on('data', (chunk) => {
      result.out += chunk.toString()
      options.callback?.(chunk, 'stdout')
    })

    childProc.stderr.on('data', (chunk) => {
      result.err += chunk.toString()
      options.callback?.(chunk, 'stderr')
    })

    childProc.on('exit', (exitCode) => {
      result.exitCode = exitCode
      if (exitCode === 0) {
        resolve(result)
      } else {
        reject(result)
      }
    })
  })
}


module.exports = {

  run
}