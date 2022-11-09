## Migration guide 1.1.0

### Key Changes

**Typed State**: from @wavesenterprise/contract-core@1.1.0 use _@Var_ decorator for entries management

Before:
  ```typescript
import {State, ContractState, Action, Param} from "@wavesenterprise/contract-core";

class Example{
      @State() state: ContractState;
  
      @Action() 
      setCoordinator(
        @Param('coordinator') coordinator: string
      ) {
        this.state.set('coordinator', coordinator)
      }
}
```

After:
```typescript
import {TVar, Var, Action} from "@wavesenterprise/contract-core";

class Example {
  @Var() coordinator: TVar<string>;

  @Action()
  setCoordinator(
      @Param('coordinator') coordinator: string
  ) {
      this.coordinator.set(coordinator)
  }
}
```

**API changes**:

Replace `start(contractPath)` with `initContract(config)`

Contract Config 
```
export type ContractConfig = {
  contractPath: string,
  concurrencyLevel?: number, // cpu's count - 1 by default
}
```






    