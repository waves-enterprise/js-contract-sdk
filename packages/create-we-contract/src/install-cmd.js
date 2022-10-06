import { execa } from 'execa';
let cmd;
export async function getInstallCmd() {
    if (cmd) {
        return cmd;
    }
    try {
        await execa('yarnpkg', ['--version']);
        cmd = 'yarn';
    }
    catch (e) {
        cmd = 'npm';
    }
    return cmd;
}
