# Quickstart

This section describes JS Сontract SDK Toolkit – a toolkit for development, testing and deploying smart contracts in Waves Enterprise public blockchain networks. Use the toolkit to fast take off with the Waves Enterprise ecosystem without using any specific programming language, because smart contracts are deployed in a Docker container. You can create a smart contract using any of the most commonly used languages, such as Typescript.

Smart contracts are often deployed into different environments and networks. For example, you can scaffold local environment based on a sandbox node and deploy contracts to this network for test use-cases.

Deploy your smart contract to different environments using WE Contract Command line interface (CLI).


## Requirements

* Node.js
* Docker

## Getting Started

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
