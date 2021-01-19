import React from 'react';
import DropDown from './dropdown';

export default class SimpleDropdown extends DropDown {
    options: { value: string, title: string }[];
    constructor(props: string) {
        super(props);
        this.options = [];
    }
    renderOptions(): React.ReactNode {
        let options = this.props.options || [];
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
