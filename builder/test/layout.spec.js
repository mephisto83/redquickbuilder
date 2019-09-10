
import fs from 'fs';
import { CreateLayout, SetCellsLayout, FindLayoutRoot } from '../app/methods/graph_methods';
import { relativeLuminance, calculateContrast } from '../app/utils/utilservice';
var smash_37 = fs.readFileSync(`./test/smash_37.rqb`, 'utf8');

describe('description', () => {

    it('should create layout', () => {
        let result = CreateLayout();
        expect(result).toBeTruthy();
        expect(result.layout).toBeTruthy();
        expect(result.properties).toBeTruthy();
    });

    it('should set cells', () => {
        let result = CreateLayout();
        result = SetCellsLayout(result, 2, null);
        expect(result).toBeTruthy();
        expect(result.layout).toBeTruthy();
        expect(Object.keys(result.layout).length).toBe(2);
        expect(Object.keys(result.properties).length).toBe(2);
    });

    it('should set cells at lower level', () => {
        let result = CreateLayout();
        result = SetCellsLayout(result, 2, null);
        let id_ = Object.keys(result.layout)[0];
        result = SetCellsLayout(result, 2, id_);
        let subRoot = FindLayoutRoot(id_, result.layout);
        expect(subRoot).toBeTruthy();
    });

    fit('should calculate luminance', () => {
        let res = relativeLuminance('#ffffff');
        expect(res).toBeTruthy();
        console.log(res);
    });

    fit('should calculate luminance', () => {
        let res = relativeLuminance('#000100');
        expect(res).toBeTruthy();
        console.log(res);
    });
    
    fit('should calculate contrast', () => {
        let res = calculateContrast('#000100', '#ffffff');
        expect(res).toBeTruthy();
        console.log(res);
    });
});
