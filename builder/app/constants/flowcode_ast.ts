import fs from 'fs';
import * as ts from 'typescript';
import path from 'path';
import { getGenericDirectory } from '../actions/remoteActions';
import { fs_readFileSync } from '../generators/modelgenerators';
import MemoryCompilerHost from './ast/compiler/MemoryCompilerHost';
import { NEW_LINE } from './nodetypes';
import { PortHandler } from '../components/flowcode/PortHandler';


export interface IFlowCodeConfig {
    declarations?: string[];
    color: string;
    template: string;
    ast?: ts.Node | null;
    filePath?: string;
    isParameter?: boolean;
}
export interface IFlowCodeStatements {
    [str: string]: IFlowCodeConfig
}
export interface IFlowCodeFile {
    [file: string]: IFlowCodeStatements
}
export const FlowCodeNameSpaces: IFlowCodeFile = {
}
export const DeclartionColors = {
    [ts.SyntaxKind.ClassDeclaration]: '#241e4e',
    [ts.SyntaxKind.InterfaceDeclaration]: '#eadaa2'
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
        config.ast = captureContents(config, false, true);
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
    // let fileContents = fs_readFileSync('./app/templates/reactweb/v1/src/actions/uiactions.d.ts', 'utf8') as string;

    // buildFunctionsFromString(fileContents);
}
export async function LoadFileSource(): Promise<IFlowCodeFile> {
    let fileSpace: IFlowCodeFile = {}
    return getGenericDirectory().then((folder: string | undefined) => {
        if (folder) {
            console.log(folder);
            function innerProcess(folder: string) {
                let files = fs.readdirSync(folder)
                files.forEach((file: string) => {
                    let file_dir_path = path.join(folder, file);
                    if (file.endsWith('.d.ts')) {
                        PortHandler.storeFlowLibrary(file, file_dir_path);
                        let fileContent = fs.readFileSync(file_dir_path, 'utf8');
                        fileSpace[file_dir_path] = buildFunctionsFromString(fileContent, file_dir_path);
                    } else if (fs.existsSync(file_dir_path) && fs.lstatSync(file_dir_path).isDirectory()) {
                        innerProcess(file_dir_path);
                    }
                })
            }
            innerProcess(folder);
        }
        return fileSpace;
    })
}
export function buildFunctionsFromString(fileContents: string, filePath: string = 'x.ts', noCapture?: boolean): IFlowCodeStatements {
    let res = ts.createSourceFile('x.ts', fileContents, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    let flowCodeFile: IFlowCodeStatements = {};
    res.statements.filter((statement: ts.Statement) => {
        switch (statement.kind) {
            case ts.SyntaxKind.ImportDeclaration:
                return false;
            default:
                return true;
        }
    }).forEach((statement: ts.Statement) => {
        let text = statement.getFullText();
        let fcConfig: IFlowCodeConfig = {
            template: text,
            color: '#f1038f'
        };

        let ast: any = captureContents(fcConfig, noCapture);
        fcConfig.filePath = filePath;
        fcConfig.ast = ast;
        flowCodeFile[ast && ast.simpleName ? ast && ast.simpleName : (ast && ast.name && ast.name.escapedText ? ast.name.escapedText : text)] = fcConfig;
    });
    return flowCodeFile
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
                    else if (statement.kind === ts.SyntaxKind.ClassDeclaration) {
                        let typeAliasDec = statement as ts.ClassDeclaration;
                        if (typeAliasDec.kind === ts.SyntaxKind.ClassDeclaration) {
                            let unionType = typeAliasDec as unknown as ts.ClassDeclaration;
                            if (unionType) {
                                // aliasTypeMembers[typeAliasDec.name.escapedText.toString()] = unionType.types;
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
function captureContents(config: IFlowCodeConfig, noCapture?: boolean, skipModifierCheck?: boolean): ts.Node | null | undefined {
    let result: ts.Node | null = null;


    let res = ts.createSourceFile('x.ts', `
    ${config.declarations ? config.declarations.join(NEW_LINE) : ''}
    ${config.template}`, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    const transformer = <T extends ts.Node>(context: ts.TransformationContext) =>
        (rootNode: T) => {
            function visit(node: ts.Node): ts.Node | undefined {
                switch (node.kind) {
                    case ts.SyntaxKind.FunctionDeclaration:
                    case ts.SyntaxKind.ClassDeclaration:
                    case ts.SyntaxKind.InterfaceDeclaration:
                    case ts.SyntaxKind.VariableDeclaration:
                    case ts.SyntaxKind.EnumDeclaration:
                        if (node.modifiers || skipModifierCheck) {
                            if (skipModifierCheck || node.modifiers && node.modifiers.find((modifier: ts.Modifier) => {
                                return modifier.kind === ts.SyntaxKind.ExportKeyword;
                            })) {

                                if (noCapture) {
                                    result = node;
                                }
                                else {
                                    let temp: any = node;
                                    if (temp && temp.name && temp.name.getText) {
                                        temp.simpleName = temp.name.getText();
                                    }
                                    result = (node);
                                }
                                return;
                            }
                        }
                }

                return ts.visitEachChild(node, visit, context);
            }
            return ts.visitNode(rootNode, visit);
        };
    ts.transform<ts.SourceFile>(res, [transformer]);
        
    return result;
}