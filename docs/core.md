## Core concepts

The basics of making a contract class is to specify class annotations per method. The most important annotations are:

* `Contract` - register class as contract
* `Action` - register action handler of contract
* `State` - decorates a class property for access to contract state
* `Param` - param decorator that map transaction params to contract class action params

```ts
@Contract
export class ExampleContract {
    @State state: ContractState;

    @Action
    greeting(@Param('name') name: string) {
        this.state.set('Greeting', `Hello, ${name}`);
    }
}
```

## Methods

## Methods to manage smart contract state

```ContractState``` class exposes useful methods to write to contract state. You can find the list of data types currently available in contract state in the node documentation. Contract SDK supports all the data types currently available in the contract state.

### Write

The easiest way to write the state is to use ```set``` method. This method automatically casts data type.
```ts
this.state.set('key', 'value')
```

For explicit type casting you should use methods in example below:

```ts
// for binary
this.state.setBinary('binary', Buffer.from('example', 'base64'));

// for boolean
this.state.setBool('boolean', true);

// for integer
this.state.setInt('integer', 102);

// for string
this.state.setString('string', 'example');
```


### Read


Reading the state is currently asynchronous, and reading behavior depends on the contract configuration.

```ts
@Contract
export class ExampleContract {
    @State state: ContractState;

    @Action
    async exampleAction(@Param('name') name: string) {
        const stateValue: string = await this.state.get('value', 'default-value');
    }
}
```

Caution: Method state.get can't know about internal state type in runtime, for explicit type casting use casted method
`getBinary`, `getString`, `getBool`, `getNum`


## Write Actions

The key decorators is `Action` and `Param`

### Init action

To describe create contract action set the ```onInit``` action decorator parameter to ```true```.

```ts
@Contract
export class ExampleContract {
    @State state: ContractState;

    @Action({onInit: true})
    exampleAction(@Param('name') name: string) {

        this.state.set('state-initial-value', 'initialized')
    }
}
```

By default action is used as the name of contract method. To set a different action name, assign it to the ```name``` parameter of the decorator.


```ts
@Contract
export class ExampleContract {
    @State state: ContractState;

    @Action({name: 'specificActionName'})
    exampleAction() {
        // Your code
    }
}
```