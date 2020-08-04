// @flow
import React, { Component } from 'react';

export default class TreeViewMenu extends Component<any, any> {
	active() {
		return this.props.active ? 'active' : '';
	}
	greyed() {
		return this.props.greyed ? { color: '#fffff' } : {};
	}
	open() {
		return this.props.open ? 'menu-open' : '';
	}
	display() {
		return this.props.open ? 'block' : 'block';
	}
	icon() {
		return this.props.icon || (this.props.children ? 'fa fa-folder' : null) || 'fa fa-wrench';
	}
	error() {
		return this.props.error ? { color: '#dd4b39', fontWeight: 'bold' } : {};
	}
	hide() {
		return this.props.hide;
	}
	render() {
    if(this.hide()){
      return <li className={`treeview ${this.active()}`}/>
    }
		return (
			<li title={this.props.description} className={`treeview ${this.active()} ${this.open()}`}>
				<a
					onClick={() => {
						if (this.props.toggle) this.props.toggle();
						if (this.props.onClick) {
							this.props.onClick();
						}
					}}
				>
					{this.props.hideIcon ? null : <i style={{ ...this.error() }} className={`${this.icon()}`} />}
					<span
						style={{ ...this.error(), ...this.greyed() }}
						title={this.props.description || this.props.title}
					>
						{this.props.title}
					</span>
					{this.props.hideArrow || !this.props.children ? null : (
						<span className="pull-right-container">
							<i className="fa fa-angle-left pull-right" />
							{this.props.right ? this.props.right : null}
						</span>
					)}
					{!this.props.hideArrow && this.props.right ? null : (
						<span className="pull-right-container">{this.props.right ? this.props.right : null}</span>
					)}
				</a>
				<ul className="treeview-menu" style={{ display: this.display(), ...this.props.innerStyle || {} }}>
					{this.props.children}
				</ul>
			</li>
		);
	}
}
