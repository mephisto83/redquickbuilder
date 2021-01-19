import * as React from 'react';
import View from './view';
import { InputEvent } from './types';
import Dropdown from './dropdown';
import Input from './input';
import Button from './button';
import { $CreateModels, $UpdateModels } from '../../actions/screenInfo';
import LienHolderInput, { LienHolder } from './lienholderinput';
export default class LienHoldersInput extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            holder: {
                liens: [],
                selected: 0
            }
        };
    }

    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        if (this.props.value !== prevProps.value) {
            this.setState({
                holder: this.props.value || {}
            });
        }
    }
    isEditMode() {
        let { viewModel } = this.props;

        let editMode = false;
        if ($CreateModels && $UpdateModels) {
            if (($CreateModels as any)[viewModel] || ($UpdateModels as any)[viewModel]) {
                editMode = true;
            }
        }
        return editMode;
    }
    render() {
        var props = {
            ...this.props
        };
        delete props.children;

        let lienHolder: LienHolders = this.state.holder;
        let liens: LienHolder[] = lienHolder.liens;
        let updateValue = () => {
            if (this.props.onChangeText) {
                this.props.onChangeText(this.state.holder);
            }
            if (this.props.onChange) {
                this.props.onChange(this.state.holder);
            }
        };
        return (
            <View>
                <View style={{ display: this.isEditMode() ? '' : 'none' }}>
                    <Button onClick={() => {
                        let liens: any[] = this.state.holder.liens;
                        liens.push({});
                        this.setState({
                            ...this.state.holder,
                            selected: liens.length - 1
                        });
                    }}>+</Button>

                </View>
                {liens.map((lien: LienHolder, index: number) => {
                    return (
                        <View key={`lien-holder-${index}`}>
                            <View onClick={() => {
                                this.setState({ selected: index })
                            }}>{lien.company ? lien.company.title : 'Unknown'}</View>
                            <Button style={{ display: this.isEditMode() ? '' : 'none' }} onClick={() => {
                                lienHolder.liens = lienHolder.liens.filter((_, v) => v !== index);
                                this.setState({
                                    holder: lienHolder,
                                    selected: 0
                                }, updateValue);
                            }}>-</Button></View>
                    );
                })}
                {
                    liens && liens[this.state.selected] ? (
                        <View>
                            <LienHolderInput viewModel={this.props.viewModel}
                                value={liens[this.state.selected]}
                                onChange={(evt: InputEvent) => {
                                    Object.assign(liens[this.state.selected], evt.target.value);
                                    this.setState({ turn: Date.now() }, updateValue)
                                }} disabled={true} />
                        </View>) : null}
            </View>
        );
    }
}

export interface LienHolders {
    liens: LienHolder[]
}