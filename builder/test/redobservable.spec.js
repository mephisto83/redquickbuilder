
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
    });

    it('should wait for both outputs before setting its value', () => {
        let result = null;
        let ob1 = new RedObservable(1).setProcess(x => x + 1).setArgs({ 'a': 0 });
        let ob2 = new RedObservable(2).setProcess(x => x + 1).setArgs({ [1]: 0 });
        let ob3 = new RedObservable(3).setProcess(x => x + 1).setArgs({ [1]: 0 });
        let ob4 = new RedObservable(4).setProcess((x, y) => {
            result = { x, y };
            return result;
        }).setArgs({ [3]: 0, [2]: 1 });
        ob1.subscribe(ob2).subscribe(ob3);
        ob2.subscribe(ob4);
        ob3.subscribe(ob4);
        expect(ob1.process).toBeTruthy();
        expect(ob2.process).toBeTruthy();
        expect(ob3.process).toBeTruthy();
        expect(ob4.process).toBeTruthy();

        expect(ob1.args).toBeTruthy();
        expect(ob2.args).toBeTruthy();
        expect(ob3.args).toBeTruthy();
        expect(ob4.args).toBeTruthy();

        ob1.update(0, 'a');

        expect(result).toBeTruthy();
        expect(ob1.value).toBe(1);
        expect(ob4.value).toBeTruthy();
        expect(ob4.value.x).toBeTruthy();
        expect(ob4.value.y).toBeTruthy();
    });

});