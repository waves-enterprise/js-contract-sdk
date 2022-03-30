import {Entrypoint} from "../src";
import {TestContract} from "./contract";


const c = TestContract;

Promise.resolve().then(async () => {
    try {
        const entry = new Entrypoint()

        entry.start();

        process.on('SIGINT', async () => {
            try {
                console.log('Graceful shutdown');
                // process.exit(0);
            } catch (err) {
                console.log(`Graceful shutdown failure: ${err.message}`);
                // process.exit(1);
            }
        });

    } catch (err) {
        console.error(err);
        // process.exit(1);
    }
});
