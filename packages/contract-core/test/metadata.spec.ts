import {Action, Contract, Param} from "../src";
import {ContractRegistry} from "../src/core/contract-registry";
import {getArgsMetadata, getContractMetadata} from "../src/core/reflect/getContractMetadata";

describe('Decorators', () => {
    describe('@Contract', () => {
        it('should apply decorator to class ', () => {
            const target = class {
            }

            Contract()(target)

            expect(ContractRegistry.getDefault()).toEqual(target)
        })
    })

    describe('@Action', () => {
        it('should add action with propertyName equals method name', () => {
            class TestClass {
                @Action()
                test() {
                }
            }

            const meta = getContractMetadata(TestClass)

            expect(meta["actions"]['test'].propertyName).toEqual('test')
            expect(meta["actions"]['test'].params.length).toEqual(0)
            expect(meta["actions"]['test'].name).toEqual('test')
        })

        it('should add action with propertyName from param decorator', () => {
            class TestClass {
                @Action({name: 'specificName'})
                test() {
                }
            }

            const meta = getContractMetadata(TestClass)

            expect(meta["actions"]['specificName'].propertyName).toEqual('test')
            expect(meta["actions"]['specificName'].params.length).toEqual(0)
            expect(meta["actions"]['specificName'].name).toEqual('specificName')
        })

        it('should add initializer action', () => {
            class TestClass {
                @Action({name: 'specificName', onInit: true})
                test() {
                }
            }

            const meta = getContractMetadata(TestClass)

            expect(meta["initializer"].propertyName).toEqual('test')
            expect(meta["initializer"].params.length).toEqual(0)
            expect(meta["initializer"].name).toEqual('specificName')
        })
    })

    describe('@Param', () => {
        it('should add param with type string', () => {
            class TestClass {
                @Action()
                test(
                    @Param('name') stringValue: string
                ) {
                }
            }

            const meta = getArgsMetadata(TestClass, 'test')

            expect(meta['arg:0'].paramKey).toEqual('name')
            expect(meta['arg:0'].index).toEqual(0)
        })

        it('should add param with type number', () => {
            class TestClass {
                @Action()
                test(
                    @Param('numberParam') numberParam: number,
                ) {
                }
            }

            const meta = getArgsMetadata(TestClass, 'test')

            expect(meta['arg:0'].paramKey).toEqual('numberParam')
            expect(meta['arg:0'].index).toEqual(0)
        })
    })
})