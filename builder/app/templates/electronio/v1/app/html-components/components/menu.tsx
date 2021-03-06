import React, { Component } from 'react';
import RedGraph from '../../actions/redgraph';
import styles from './menu.css';
import { redConnect, titleService } from '../../actions/util';

interface MenuItem {
	id: string,
	properties: {
		disabled: boolean | Function,
		id: string,
		parent: string | null,
		title: string,
		screen: string,
		execute?: Function
	}
}

export default class Menu extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let children = null;
		if (this.props.id) {
			children = RedGraph.getChildren(this.props.value, this.props.id);
			return (
				<div className={`${styles['dropdown-content']} menu-drop-down-content`}>
					{children.map((child: MenuItem, index: number) => this.renderItem(child, index))}
				</div>
			);
		}
		children = RedGraph.getChildren(this.props.value, null);
		return (
			<div className={`${styles.topnav} menu-drop-down-content`}>
				{children.map((child: MenuItem, index: number) => this.renderItem(child, index))}
			</div>
		);
	}
	renderItem(child: MenuItem, index: number) {
		let id = RedGraph.getId(child);
		let title = RedGraph.getTitle(this.props.value, id);
		let children = RedGraph.getChildren(this.props.value, id);
		let { titleService } = this.props;
		let submenu = null;
		if (children.length) {
			return (
				<div key={`menu-${index}`} className={`${styles.dropdown} menu-drop-down`}>
					<button className={`${styles.dropbtn} menu-drop-down-button`}>
						{titleService ? titleService.getTitle(title) : title}
						<i className="fa fa-caret-down" />
					</button>
					<Menu
						value={this.props.value}
						id={id}
						onClick={(id: any) => {
							if (this.props.onClick) {
								this.props.onClick(id);
							}
						}}
					/>
				</div>
			);
		}
		return (
			<a
				className={`${styles.menuDropDownMenu} menu-drop-down-button`}
				key={`menu-leaf-${index}`}
				onClick={() => {
					if (child && child.properties && child.properties.execute) {
						child.properties.execute()
					}
					else if (this.props.onClick) {
						if (child && child.properties && child.properties.screen) {
							this.props.onClick(child.properties.screen)
						}
						else {
							this.props.onClick(id);
						}
					}
				}}
			>
				<span>{this.props.titleService ? this.props.titleService.getTitle(title) : title}</span>
			</a>
		);
	}
}
