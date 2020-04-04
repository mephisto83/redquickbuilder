import React, { Component } from 'react';
import RedGraph from '../../actions/redgraph';
import styles from './menu.css';
import { redConnect, titleService } from '../../actions/util';

export default class Menu extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		let children = null;
		if (this.props.id) {
			children = RedGraph.getChildren(this.props.value, this.props.id);
			return (
				<ul
					style={{ display: this.props.open ? 'block' : '', '--item-count': children.length }}
					className={`${styles.nav} ${styles['nav']} ${this.props.open ? styles['nav-open'] : ''} ${styles[
						'nav-treeview'
					]} ${styles['flex-column']}`}
				>
					{children.map((child, index) => this.renderItem(child, index))}
				</ul>
			);
		}
		children = RedGraph.getChildren(this.props.value, null);
		return (
			<nav className={`${styles['mt-2']}`}>
				<ul
					className={`${styles.nav} ${styles['nav-pills']} ${styles['nav-sidebar']} ${styles['flex-column']}`}
				>
					{children.map((child, index) => this.renderItem(child, index))}
				</ul>
			</nav>
		);
	}
	isParent(child, index) {
		const id = RedGraph.getId(child);
		const children = RedGraph.getChildren(this.props.value, id);
		return children && children.length;
	}
	isActive(child, index) {
		let id = RedGraph.getId(child);
		return this.state.openMenu === id;
	}
	getIcon(child, index) {
		let isActive = this.isActive(child, index);
		let isParent = this.isParent(child, index);
		return `${styles['nav-icon']} ${isParent ? 'fas fa-angle-right' : 'far fa-circle'} ${isActive ? styles['icon-active'] : ''}`;
	}
	renderItem(child, index) {
		let id = RedGraph.getId(child);
		let title = RedGraph.getTitle(this.props.value, id);
		let children = RedGraph.getChildren(this.props.value, id);
		let submenu = null;
		const { openMenu } = this.state;
		let { titleService } = this.props;
		return (
			<li
				className={`${styles['nav-item']}
        ${openMenu === id ? styles['menu-opn'] : ''}
        ${children && children.length ? styles['has-treeview'] : ''} menu-drop-down`}
				onClick={() => {
					if (this.props.toggleVisual) {
						this.props.toggleVisual('menu-item-open', id);
					} else {
						this.setState({
							openMenu: this.state.openMenu === id ? '' : id
						});
					}
					if (this.props.onClick) {
						this.props.onClick(id);
					}
				}}
			>
				<a
					className={`${styles['nav-link']} ${this.isActive(child, index)
						? styles['active']
						: ''} menu-drop-down-button`}
				>
					<i className={`${this.getIcon(child, index)}`} />
					<p>{titleService ? titleService.getTitle(title) : title}</p>
				</a>
				{children && children.length ? (
					<Menu
						open={this.state.openMenu === id}
						value={this.props.value}
						id={id}
						onClick={(id) => {
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
