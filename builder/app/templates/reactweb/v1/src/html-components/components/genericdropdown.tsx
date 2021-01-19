import React from 'react';
import Validation from './validation';
import InputFunctions from './inputfunctions';
import { uuidv4 } from './util';
import { $CreateModels, $UpdateModels } from '../../actions/screenInfo';
import DropDown from './dropdown';

export default class GenericDropDown extends DropDown {
    options: { value: string, title: string }[];
    constructor(props: string) {
        super(props);
        this.options = []
    }

    getOptions(): { value: string, title: string }[] {
        return this.options;
    }

    renderOptions(): React.ReactNode {
        let options = this.options;
        if (options) {
            return options.map((item: { value: string; title: string }) => {
                return (
                    <option key={`${item.title}-$-${item.value}`} value={item.value}>
                        {item.title}
                    </option>
                );
            });
        }
        return [];
    }
}
