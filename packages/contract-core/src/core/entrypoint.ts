import {Kernel} from "./handlers/kernel";

export function start(contractPath: string) {
    Promise.resolve().then(async () => {
        try {
            await new Kernel({contractPath})
                .start();

            process.on('SIGINT', async () => {
                try {
                    console.log('Graceful shutdown');
                    process.exit(0);
                } catch (err) {
                    console.log(`Graceful shutdown failure: ${err.message}`);
                    process.exit(1);
                }
            });
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    });
}
