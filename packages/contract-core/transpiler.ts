import * as ts from "typescript";
import {VariableDeclaration} from "typescript";

let program = ts.createProgram(['test.ts'], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
});

const visit = (node: ts.Node) => {
    if (ts.isVariableStatement(node)) {

        if (ts.isVariableDeclarationList(node.declarationList)) {


            node.declarationList.declarations.map((i: VariableDeclaration) => {

                if (!i.initializer) {
                    return
                }


                if ( ts.isBinaryExpression(i.initializer)) {
                    console.log(ts.factory.createMultiply(i.initializer.left, i.initializer.right))
                }
            })

            console.log('---')
        }
        //extract decorator
        // node.decorators?.map((decorator) => {
        //     if (ts.isDecorator(decorator) || ts.isCallExpression(decorator)) {
        //         console.log(decorator.expression.na);
        //     }
        // })
    }
}

// Visit every sourceFile in the program
for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, visit);
    }
}

