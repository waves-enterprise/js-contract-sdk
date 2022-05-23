# @wavesenterpise/contract-core

Implements JS Contract SDK core functionality, rpc services, tools and utilities.

### Getting Started

Run following in command line:

```bash 
npm i @wavesenterpise/contract-core
```

Create `contract.ts` as follows

```ts 
import {Action, Contract, ContractState, Param, State} from '@wavesenterpise/contract-core';

@Contract
class MyContract {
    @State state: ContractState;

    @Action
    greeting(@Param('name') name: string) {
        this.state.set('greeting', `Hello, ${name}`);
    }
}
```


## License

This project is licensed under the [MIT License](LICENSE).

