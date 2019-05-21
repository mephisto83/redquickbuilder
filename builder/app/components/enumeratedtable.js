

// @flow
import React, { Component } from 'react';


export default class EnumeratedTable extends Component {
    render() {
        var me = this;
        var dataFunc = me.props.dataFunc || ((y) => y || '');
        var rows = (me.props.data || []).map((x, xi) => {
            return (<tr key={`${xi}-row`}>
                {(me.props.columns || []).map((c, inde) => {
                    return (<td key={`${inde}-${xi}-cell`}>{dataFunc(x[c.value], c.value, xi)}</td>)
                })
                }
                {(me.props.columnButtons || []).map((fx, inde) => {
                    return (<td key={`${inde}-${xi}-cell-btn`}>{fx(x, xi)}</td>)
                })}
            </tr>);
        });
        var headers = (me.props.columns || []).map((x, index) => {
            return (<th key={`col-${index}`}>{x.title}</th>)
        });

        (me.props.columnButtons || []).map((fx, inde) => {
            headers.push(<th key={`${inde}-cell-header`}></th>)
        })
        var ops = {};
        ops.style = { maxHeight: this.props.maxHeight || 500, overflowY: 'auto' }
        return (
            <div {...ops}>
                <table className="table table-bordered">
                    <tbody>
                        <tr>
                            {headers}
                        </tr>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}