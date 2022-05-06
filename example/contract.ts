import {Action, assert, Context, Contract, ContractState, Ctx, Param, State} from "../packages/contract-core/src";

@Contract()
export class TestContract {
    @State state: ContractState;
    @Ctx context: Context;

    @Action({onInit: true})
    async init() {
        this.state.set('moveNum', 0)
        this.state.set('currentMover', 'x')
    }

    @Action
    async move(
        @Param('player') player: string,
        @Param('cell') cell: number,
    ) {

        const moveNum = await this.state.get<number>('moveNum');
        const currentMover = await this.state.get<string>('currentMover')

        assert(moveNum !== -1, "Some message");

        if (currentMover !== player) {
            throw new Error('Current move should make ' + currentMover);
        }
        const cellKey = 'cell-' + cell;

        const prev = await this.state.get<string>(cellKey)

        if (prev || cell > 8 || cell < 0) {
            throw new Error('Cell is not available');
        }

        this.state.set(cellKey, player);
        this.state.set('moveNum', moveNum + 1);
        this.state.set('currentMover', currentMover === 'x' ? 'o' : 'x');

        // Binary values
        const buffer = await this.state.getBinary('buffer-value')
        // Set
        this.state.setBinary('buffer-value', buffer)
        // or
        this.state.set('buffer-value', Buffer.from('example'))

        // String values
        const stringVal = await this.state.getString('string-value')
        // Set
        this.state.setString('string-value', stringVal + 'example')
        // or
        this.state.set('string-value', stringVal + 'example')

        // Number values
        const numVal = await this.state.getInt('num-value')
        // Set
        this.state.setInt('num-value', numVal + 1)
        // or
        this.state.set('num-value', numVal + 2)

        // Bool values
        const boolVal = await this.state.getBool('bool-value')
        // Set
        this.state.setBool('bool-value', !boolVal)
        // or
        this.state.set('bool-value', !boolVal)

        const mapping = this.state.getMapping('USER');

        mapping.set('2', 'Alexey'); // mapped to USER_2 => Alexey

        await mapping.get('1'); // Mapped to USER_1
    }
}