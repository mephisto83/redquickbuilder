import { spy } from 'sinon';
import * as DC from '../app/actions/data-chain';
import { makeDefaultState, updateUI } from '../app/reducers/uiReducer';
import { setDispatch, setTestGetState } from '../app/actions/uiActions'; 
describe('{{name}} specs', () => {
    let state;
    beforeEach(()=>{
        state = (makeDefaultState());
        let app_state = { uiReducer: state };
        setDispatch(() => {

        });
        setTestGetState(() => {
            return app_state;
        });
    });
{{tests}}
});
