import * as React from 'react';
import {
    View
} from 'native-base';
import { redConnect, titleService } from '../actions/util';

// {{name}}
class {{name}} extends React.Component {
    static navigationOptions = {
        title: titleService.get({{title}}),
    };

    render() {
        return (
            <View>
            </View>
        );
    }
}

export default redConnect({{name}});