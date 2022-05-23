# JS Contract SDK

Toolkit for development, test and deploy smart-contracts on Waves Enterprise ecosystem.


## Documentation

All JS contract SDK documentation, can be found at:
https://docs.wavesenterprise.com/ru/1.8.4/usage/docker-sc/sc-opensource.html


## Quickstart

The fastest way to get started with JS Contract SDK is to use contract starter CLI commands.

To create a new project using CLI, run the following command and follow the instructions

```npm
npm create we-contract [options] MyContract
```

The next step is to install new project dependencies:

```npm
cd contract-project-path
npm install
```

After you have all dependencies installed, edit the `src/contract.ts` file and write actions you need in your contract:

```typescript
@Contract()
export default class MyContract {
    @State state: ContractState


    @Action
    async greet(
        @Param('name') name: string
    ) {
        const Greeting = await this.state.tryGet('Greeting');

        assert(Greeting === null, 'you already greeted');

        this.state.set('Greeting', `Hello, ${name}`);
    }
}
```


Once you finish write your contract actions, you can deploy your contract to network, i.e to deploy to local sandbox network run following: 

```npm 
npm run deploy:sandbox
```

Make sure you setup your network credentials in ```contract.config.js```

## License

This project is licensed under the [MIT License](LICENSE).