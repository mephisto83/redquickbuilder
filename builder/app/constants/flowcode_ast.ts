import fs from 'fs';
import * as ts from 'typescript';
import { fs_readFileSync } from '../generators/modelgenerators';
import MemoryCompilerHost from './ast/compiler/MemoryCompilerHost';
import { NEW_LINE } from './nodetypes';


export interface IFlowCodeConfig {
    declarations?: string[];
    color: string;
    template: string;
    ast?: ts.Node | null;
    isParameter?: boolean;
}
export interface IFlowCodeStatements {
    [str: string]: IFlowCodeConfig
}
export const FlowCodeStatements: IFlowCodeStatements = {
    Assignment: {
        color: '#DD4B39',
        template: `let $$$var: $$$type = $$$statement;`,
    },
    GetItem: {
        color: '#3A405A',
        template: `export declare function GetItem(modelType: string, id: string): any;`
    },
    ForEach: {
        color: '#0B032D',
        declarations: [],
        template: `export declare function forEach(array: T[], callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;`
    },
    ForEachBreak: {
        color: '#0B032D',
        declarations: [],
        template: `export declare function forEach(array: T[], callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;`
    },
    IsEqual: {
        color: '#3FA7D6',
        template: `export declare function isEqual(a: any, b: any): boolean`
    },
    IsGreaterThan: {
        color: '#3FA7D6',
        template: `export declare function isGreaterThan(a: any, b: any): boolean`
    },
    IsLessThan: {
        color: '#3FA7D6',
        template: `export declare function isLessThan(a: any, b: any): boolean`
    },
    isNull: {
        color: '#3FA7D6',
        template: `export declare function isNull(a: any): boolean`
    },
    not: {
        color: '#3FA7D6',
        template: `export declare function not(a: any): boolean`
    }
}


export function buildAst(config: IFlowCodeConfig) {

    if (config) {
        config.ast = captureContents(config);
    }
}

export interface ICapturedContents {
    kind: ts.SyntaxKind;
    initializer: ts.Expression | undefined;
    bindingName: ts.BindingName;
    name?: fl.Identifier;
    type: ts.TypeNode | undefined;
    parameters: fl.ParameterDeclaration[]
}
declare namespace fl {
    export interface Identifier {
        parent?: any;
        kind: ts.SyntaxKind
        text: string;
    }
    export interface ParameterDeclaration {

    }
}
function stripConvertParent(item: any): any {
    let result: any = {};
    for (var i in item) {
        if (Array.isArray(item[i])) {
            result[i] = item[i].map((v: any) => stripConvertParent(v));
        }
        else if (typeof item[i] === 'object') {
            if (typeof item[i] !== 'function') {
                if (i !== 'parent') {
                    result[i] = stripConvertParent(item[i]);
                }
            }
        }
        else if (typeof item[i] === 'function') {
            if (i === 'getText' && item.getText) {
                result.escapedText = result.escapedText || item.getText();
            }
        }
        else {
            result[i] = item[i];
        }
    }
    return result;
}
export function buildFunctions() {
    let fileContents = fs_readFileSync('./app/templates/reactweb/v1/src/actions/uiactions.d.ts', 'utf8') as string;

    let res = ts.createSourceFile('x.ts', fileContents, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);


    res.statements.forEach((statement: ts.Statement) => {
        let text = statement.getFullText();
        let fcConfig: IFlowCodeConfig = {
            template: text,
            color: '#f1038f'
        };

        let ast: any = captureContents(fcConfig);
        fcConfig.ast = ast;
        FlowCodeStatements[ast && ast.name && ast.name.escapedText ? ast.name.escapedText : text] = fcConfig;
    })
}
export function buildRules() {
    let fileContents = fs.readFileSync('D:\\dev\\redquickbuilder\\builder\\node_modules\\typescript\\lib\\typescript.d.ts', 'utf-8');

    let res = ts.createSourceFile('x.ts', fileContents, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

    let modules = captureModules(res);
    debugger
    let syntaxKindMembers: ts.EnumMember[] = [];
    let aliasTypeMembers: {
        [name: string]: ts.Type[]
    } = {};

    modules.filter(v => v.kind === ts.SyntaxKind.ModuleDeclaration).forEach((module: ts.Node) => {
        let moduleDec = module as ts.ModuleDeclaration;
        if (moduleDec.body) {
            let modBlock = moduleDec.body as ts.ModuleBlock;
            if (modBlock) {
                modBlock.statements.forEach((statement: ts.Statement) => {
                    if (statement.kind === ts.SyntaxKind.EnumDeclaration) {
                        let enumDec = statement as ts.EnumDeclaration;
                        if (enumDec) {
                            if (enumDec.name.escapedText === 'SyntaxKind') {
                                syntaxKindMembers = enumDec.members as any;
                            }
                        }
                    }
                    else if (statement.kind === ts.SyntaxKind.TypeAliasDeclaration) {
                        let typeAliasDec = statement as ts.TypeAliasDeclaration;
                        if (typeAliasDec.type.kind === ts.SyntaxKind.UnionType) {
                            let unionType = typeAliasDec.type as unknown as ts.UnionType;
                            if (unionType) {
                                aliasTypeMembers[typeAliasDec.name.escapedText.toString()] = unionType.types;
                            }
                        }
                    }
                })
            }
        }
    });
}

function captureModules(node: ts.Node): ts.Node[] {
    let result: ts.Node[] = [];
    const findTs = <T extends ts.Node>(context: ts.TransformationContext) => (rootNode: T) => {
        function visit(node: ts.Node): ts.Node | undefined {
            switch (node.kind) {
                case ts.SyntaxKind.ModuleDeclaration:
                    result.push(node);
                    return;
            }

            return ts.visitEachChild(node, visit, context);
        }
        return ts.visitNode(rootNode, visit);
    }
    ts.transform(node, [findTs]);

    return result;
}
function captureContents(config: IFlowCodeConfig): ts.Node | null | undefined {
    let result: ts.Node | null = null;


    let res = ts.createSourceFile('x.ts', `
    ${config.declarations ? config.declarations.join(NEW_LINE) : ''}
    ${config.template}`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    const transformer = <T extends ts.Node>(context: ts.TransformationContext) =>
        (rootNode: T) => {
            function visit(node: ts.Node): ts.Node | undefined {
                switch (node.kind) {
                    case ts.SyntaxKind.FunctionDeclaration:
                        let func = node as ts.FunctionDeclaration;
                        result = stripConvertParent(func);
                        return;
                    case ts.SyntaxKind.VariableDeclaration:
                        let vdl = node as ts.VariableDeclaration;
                        result = stripConvertParent(vdl);
                        return;
                }

                return ts.visitEachChild(node, visit, context);
            }
            return ts.visitNode(rootNode, visit);
        };
    ts.transform<ts.SourceFile>(res, [transformer]);

    return result;
}