## Typed State
`@Var` decorates any contract entry
      
```typescript
@Contract()
class Example {
    @Var({ mutable: false }) adminKey: TVar<string>;    
    @Var({ name: 'k_quoteAssetWeight'}) quoteWeight: TVar<number>; 
    @Var({ name: 'k_baseAssetWeight'}) baseWeight: TVar<number>; 
      
    @Action setAdminKey(
        @Param('adminKey') adminKey: string
    ) {
        this.adminKey.set(adminKey)
    }
    
    @Action setQuoteWeight(
        @Param('adminKey') adminKey: string
    ) {
        this.quoteWeight.set(100000000)// map to `k_quoteAssetWeight` key
        this.quoteWeight.set(900000000)// map to `k_baseAssetWeight` key
    }
}
```
By default `@Var` uses property name to assign key of data entry, to specify
entry key pass `name` param.

Mutablility of entries defines by param `mutable` (true by default),
If specify `mutable: false`, change of this property is allows only in CreateContractTransaction (103) with Action annotated with `@Action({onInit: true})`.

Example:

```typescript
import {Contract, TVar} from "@wavesenterprise/contract-core";

@Contract
class EntriesExample {
    @Var({ mutable: false }) 
    todaysmood: TVar<string>
    
    @Action({onInit: true})
    _contstructor() {

        // Correct. Sets value
        this.constantValue.set('Everything ok!');
    }
    
    @Action
    makeSad() {
        // Throws Non Retryable ContractError
        this.constantValue.set('Sad :(');
    }
}
```

### Preload 

Node uses RPC calls on every read entry, make rpc call sometimes may cause performance issues.
For perfomance issues use method ```preload```, 
to batch preload contract entries.  

Usage:

```typescript
import {Contract, preload, TVar} from "@wavesenterprise/contract-core";

@Contract
class EntriesExample {
    @Var() angryFriend: TVar<string>
    @Var() funnyFriend: TVar<string>
    
    @Action
    async makeSad() {
        await preload(this, ['angryFriend', 'funnyFriend']);
        
        // uses cached values by tx context, doesn't make request on every call
        const funnyFriend = await this.funnyFriend.get();
        const angryFriend = await this.angryFriend.get();
    }
}
```
    