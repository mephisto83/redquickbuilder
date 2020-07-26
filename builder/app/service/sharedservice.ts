import ComponentStyle, { ComponentStyleType } from '../components/componentstyle';
import { GetNodeProp } from '../methods/graph_methods';
import { GetJSCodeName } from '../actions/uiactions';
import { NodeProperties } from '../constants/nodetypes';

export function constructCellStyles(cellStyleArray: any, onComponent = false) {
	let onCellStyles: ComponentStyle[] = cellStyleArray.filter((x: ComponentStyle) => {
		return x && x.onComponent == onComponent;
	});
  let cellStylesReact: string[] = [];

	let cellStyles = onCellStyles
		.map((cs: ComponentStyle) => {
			switch (cs.componentStyleType) {
				case ComponentStyleType.ComponentApi:
					let { negate } = cs;
					if (cs.styleComponent) {
						let styleText = GetNodeProp(cs.styleComponent, NodeProperties.Style);
						if (styleText) {
							cellStylesReact.push(
								` ...(${negate ? '!' : ''}this.state.${GetJSCodeName(
									cs.componentApi
								)} ? ${JSON.stringify(styleText, null, 4)} : {})`
							);
						}
						return `$\{(${negate ? '!' : ''}this.state.${GetJSCodeName(cs.componentApi)} ?'${GetJSCodeName(
							cs.styleComponent
						)}' : '')}`;
					}
					break;
			}
		})
		.filter((x: any) => x)
		.join('');
	return { cellStyles, cellStylesReact };
}
