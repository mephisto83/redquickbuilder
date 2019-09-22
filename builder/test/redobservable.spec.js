
import fs from 'fs';
import RedObservable from '../app/utils/observable';


describe('data_chain_example', () => {

    it('should creat redobservable', () => {
        let result = new RedObservable('ok');
        expect(result).toBeTruthy();
    });

    it('should set the redobservable process', () => {
        let ob1 = new RedObservable('ok');
        let ob2 = new RedObservable('ok2');
        let result = null;
        ob2.setProcess(x => result = x).setArgs({ ok: 0 });
        ob1.setProcess(x => x + 1).setArgs({ a: 0 }).subscribe(ob2);

        ob1.update(1, 'a')

        expect(result).toBe(2);
    })

});