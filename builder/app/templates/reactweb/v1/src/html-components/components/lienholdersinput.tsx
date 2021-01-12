import * as React from 'react';
import View from './view';
import { InputEvent } from './types';
import Dropdown from './dropdown';
import Input from './input';
import Button from './button';
import LienHolderInput, { LienHolder } from './lienholderinput';
export default class LienHoldersInput extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            holders: {
                liens: [],
                selected: 0
            }
        };
    }

    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        if (this.props.value !== prevProps.value) {
            this.setState({
                holders: this.props.value || {}
            });
        }
    }
    render() {
        var props = {
            ...this.props
        };
        delete props.children;

        let lienHolder: LienHolders = this.state.lienHolderInput;
        let liens: LienHolder[] = lienHolder.liens;
        return (
            <View>
                <View>
                    <Button onClick={() => {
                        let lien: any[] = this.state.holders.lien;
                        lien.push({});
                        this.setState({
                            ...this.state.holders
                        });
                    }}>+</Button>
                    <Button onClick={() => {
                        if (liens && liens[this.state.selected]) {
                            let updated = liens.filter((_, v) => v !== this.state.selected);
                            this.setState({
                                liens: updated,
                                selected: 0
                            })
                        }
                    }}>-</Button>
                </View>
                <Dropdown
                    option={liens.map((x: LienHolder, index: number) => ({ title: x.company.title, value: index }))}
                    value={this.state.selected}
                    onChange={(evt: InputEvent) => {
                        if (evt && evt.target) {
                            this.setState({
                                selected: evt.target.value
                            })
                        }
                    }} />
                {
                    liens && liens[this.state.selected] ? (
                        <View>
                            <LienHolderInput
                                value={liens[this.state.selected]}
                                onChange={(evt: InputEvent) => {
                                    this.setState({ turn: Date.now() })
                                }} disabled={true} />
                        </View>) : null}
            </View>
        );
    }
}

export interface LienHolders {
    liens: LienHolder[]
}