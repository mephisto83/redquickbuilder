import * as NodeTypes from '../app/constants/nodetypes';
import fs from 'fs';
import {
    NodesByType, GRAPHS, UIC, CURRENT_GRAPH, APPLICATION,
    setTestGetState, _getPermissionsConditions, GetChildComponentAncestors, GetCodeName, GetState, BuildPackage
} from '../app/actions/uiactions';
import { updateUI, makeDefaultState } from '../app/reducers/uiReducer';
import { GenerateModelKeys } from '../app/service/keyservice';
import { GetPropertyConsts, GetModelConsts, GetModelPropertyConsts, GetRNConsts, GetRNModelInstances } from '../app/service/layoutservice';
import { GetSpecificModels } from '../app/constants/nodepackages';
var smash_42 = fs.readFileSync(`./test/smash_42.rqb`, 'utf8');
var smash_43 = fs.readFileSync('./test/smash_43.rqb', 'utf8');

describe('smash_42', () => {
    let graph = JSON.parse(smash_42);
    let state = updateUI(makeDefaultState(), UIC(GRAPHS, graph.id, graph))
    state = updateUI(state, UIC(APPLICATION, CURRENT_GRAPH, graph.id));
    let app_state = { uiReducer: state };
    setTestGetState(() => {
        return app_state;
    });


    it('should get the ancestors up to the page', () => {
        let childNode = 'f92068f4-f15d-4ea1-8fa4-a019f8a1d90e';

        let ancestors = GetChildComponentAncestors(childNode);
        expect(ancestors).toBeTruthy();
        expect(ancestors.length).toBeTruthy();
        expect(ancestors.length).toBe(2);
    });
});

describe('smash_43', () => {
    let graph = JSON.parse(smash_43);
    let state = updateUI(makeDefaultState(), UIC(GRAPHS, graph.id, graph))
    state = updateUI(state, UIC(APPLICATION, CURRENT_GRAPH, graph.id));
    let app_state = { uiReducer: state };
    setTestGetState(() => {
        return app_state;
    });


    it('should get the model costs for a component', () => {
        let childNode = '8d376dce-7faa-4635-9a99-02c72f15e277';
        let propertyConsts = GetPropertyConsts(childNode);
        expect(propertyConsts).toBeTruthy();
        expect(propertyConsts.length).toBe(2);
    })


    it('should ge the consts for a component', () => {
        let childNode = '8d376dce-7faa-4635-9a99-02c72f15e277';
        let propertyConsts = GetModelConsts(childNode);
        expect(propertyConsts).toBeTruthy();
        expect(propertyConsts.length).toBe(1);
    });

    it('should ge the consts for a component', () => {
        let childNode = '8d376dce-7faa-4635-9a99-02c72f15e277';
        let propertyConsts = GetModelPropertyConsts(childNode);
        expect(propertyConsts).toBeTruthy();
        expect(propertyConsts.length).toBe(1);
    });

    it('should get consts for react-native component', () => {
        let childNode = '8d376dce-7faa-4635-9a99-02c72f15e277';
        let rnConsts = GetRNConsts(childNode);
        expect(rnConsts).toBeTruthy();
        expect(rnConsts.length).toBeTruthy();
    });

    it('should get model instances for the react-native component', () => {
        //let loginModel = GetScreenInstance(state, ScreenInstances.LoginForm, const_loginModel) || CreateDefaultLoginModel();
        let childNode = '8d376dce-7faa-4635-9a99-02c72f15e277';
        let model_instances = GetRNModelInstances(childNode);
        expect(model_instances).toBeTruthy();
        expect(model_instances.length).toBeTruthy();
    });


    it('should create add a models basic get package', () => {
        let model = NodesByType(GetState(), NodeTypes.Model);
        expect(model).toBeTruthy();

        BuildPackage(model, GetSpecificModels)
    })
});
