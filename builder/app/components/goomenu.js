// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';

export default class NavBarButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
            id: UIA.GUID()
        }
    }
    icon() {
        return this.props.icon || "fa fa-gears"
    }
    menuItems() {
        var result = [];
        var { menuItems } = this.props;
        if (menuItems) {
            menuItems.map((mi, index) => {
                if (mi.onClick && mi.icon) {
                    result.push((
                        <a key={`goo-menu-${this.state.id}-icon-index-${index}`} title={mi.title} className="menu-item" onClick={mi.onClick} style={{ pointerEvents: 'all' }}> <i className={mi.icon}></i> </a>
                    ));
                }
            })
        }
        return result;
    }
    render() {
        if (!this.props.visible) {
            return <div></div>
        }
        var menuItems = this.menuItems();
        return (
            <div className="goo-menu container" style={{
                position: 'absolute',
                top: this.props.top || 0,
                left: this.props.left || 0
            }}>
                <nav className="menu" style={{ pointerEvents: 'none' }}>
                    <input
                        type="checkbox"
                        onChange={() => {
                            if (this.props.onToggle) {
                                this.props.onToggle();
                            }
                        }}
                        checked={this.props.open}
                        style={{ pointerEvents: 'all' }}
                        href="#" className="menu-open"
                        id={`${this.state.id}`} />
                    <label className="menu-open-button" htmlFor={`${this.state.id}`} style={{ pointerEvents: 'all' }}>
                        <span className="hamburger hamburger-1"></span>
                        <span className="hamburger hamburger-2"></span>
                        <span className="hamburger hamburger-3"></span>
                    </label>
                    {menuItems}
                    {/* <a href="#" className="menu-item" style={{ pointerEvents: 'all' }}> <i className="fa fa-bar-chart"></i> </a>
                    <a href="#" className="menu-item" style={{ pointerEvents: 'all' }}> <i className="fa fa-plus"></i> </a>
                    <a href="#" className="menu-item" style={{ pointerEvents: 'all' }}> <i className="fa fa-heart"></i> </a>
                    <a href="#" className="menu-item" style={{ pointerEvents: 'all' }}> <i className="fa fa-envelope"></i> </a>
                    <a href="#" className="menu-item" style={{ pointerEvents: 'all' }}> <i className="fa fa-cog"></i> </a>
                    <a href="#" className="menu-item" style={{ pointerEvents: 'all' }}> <i className="fa fa-ellipsis-h"></i> </a> */}
                </nav>
            </div>);
    }
}

export class GooMenuSVG extends Component {
    render() {
        return (
            <div style={{ display: 'none' }}>
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                    <defs>
                        <filter id="shadowed-goo">

                            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
                            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                            <feGaussianBlur in="goo" stdDeviation="3" result="shadow" />
                            <feColorMatrix in="shadow" mode="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 -0.2" result="shadow" />
                            <feOffset in="shadow" dx="1" dy="1" result="shadow" />
                            <feComposite in2="shadow" in="goo" result="goo" />
                            <feComposite in2="goo" in="SourceGraphic" result="mix" />
                        </filter>
                        <filter id="goo">
                            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
                            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                            <feComposite in2="goo" in="SourceGraphic" result="mix" />
                        </filter>
                    </defs>
                </svg>
            </div>
        );
    }
}