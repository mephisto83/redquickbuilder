import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as UIA from '../actions/uiactions';
export function mapStateToProps(state) {
    return {
        state
    };
}

export function mapDispatchToProps(dispatch) {
    return bindActionCreators({ ...UIA }, dispatch);
}


export function UIConnect(component) {
    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(component);
}