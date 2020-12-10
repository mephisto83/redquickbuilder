import React, { Component } from 'react';
import RedGraph from '../../actions/redgraph';
import './menu.css';
import { redConnect, titleService } from '../../actions/util';

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
				<ul
					style={{
						display: this.props.open ? 'block' : '',
						/*
			 // @ts-ignore */
						'--item-count': children.length
					}}
					className={` nav nav  ${this.props.open ? 'nav-open' : ''} nav-treeview  flex-column `}
				>
					{children.map((child: any, index: any) => this.renderItem(child, index))}
				</ul>
			);
		}
		children = RedGraph.getChildren(this.props.value, null);
		return (
			<nav className={` mt-2 `}>
				<ul
					className={` nav  nav-pills   nav-sidebar   flex-column `}
				>
					{children.map((child: any, index: any) => this.renderItem(child, index))}
				</ul>
			</nav>
		);
	}
	isParent(child: any, index: any) {
		const id = RedGraph.getId(child);
		const children = RedGraph.getChildren(this.props.value, id);
		return children && children.length;
	}
	isActive(child: any, index: any) {
		let id = RedGraph.getId(child);
		return this.state.openMenu === id;
	}
	getIcon(child: any, index: any) {
		let isActive = this.isActive(child, index);
		let isParent = this.isParent(child, index);
		return ` nav-icon  ${isParent ? 'fas fa-angle-right' : 'far fa-circle'} ${isActive
			? 'icon-active'
			: ''}`;
	}
	renderItem(child: any, index: any) {
		let id = RedGraph.getId(child);
		let title = RedGraph.getTitle(this.props.value, id);
		let children = RedGraph.getChildren(this.props.value, id);
		let submenu = null;
		const { openMenu } = this.state;
		let { titleService } = this.props;
		return (
			<li
				key={`li-${index}`}
				className={` nav-item
				${openMenu === id ? 'menu-opn' : ''}
				${children && children.length ? 'has-treeview' : ''} menu-drop-down`}
				onClick={() => {
					if (this.props.toggleVisual) {
						this.props.toggleVisual('menu-item-open', id);
					} else {
						this.setState({
							openMenu: this.state.openMenu === id ? '' : id
						});
					}

					if (child && child.properties && child.properties.execute) {
						child.properties.execute()
					}
					else if (this.props.onClick) {
						this.props.onClick(id);
					}
				}}
			>
				<a
					className={` nav-link  ${this.isActive(child, index)
						? 'active' : ''} menu-drop-down-button`}
				>
					<i className={`${this.getIcon(child, index)}`} />
					<p>{titleService ? titleService.getTitle(title) : title}</p>
				</a>
				{children && children.length ? (
					<Menu
						open={this.state.openMenu === id}
						value={this.props.value}
						id={id}
						onClick={(id: any) => {
							if (this.props.onClick) {
								this.props.onClick(id);
							}
						}}
					/>
				) : null}
			</li>
		);
	}
}
