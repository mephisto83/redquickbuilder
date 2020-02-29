import React, { Component } from "react";
import RedGraph from "../../actions/redgraph";
import styles from "./menu.css";

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
        <div className={styles["dropdown-content"]}>
          {children.map((child, index) => this.renderItem(child, index))}
        </div>
      );
    }
    children = RedGraph.getChildren(this.props.value, null);
    return (
      <div className={`${styles.topnav}`}>
        {children.map((child, index) => this.renderItem(child, index))}
      </div>
    );
  }
  renderItem(child, index) {
    let id = RedGraph.getId(child);
    let title = RedGraph.getTitle(this.props.value, id);
    let children = RedGraph.getChildren(this.props.value, id);
    let submenu = null;
    if (children.length) {
      return (
        <div className={styles.dropdown}>
          <button className={styles.dropbtn}>
            {this.props.titleService
              ? this.props.titleService.getTitle(title)
              : title}
            <i className="fa fa-caret-down"></i>
          </button>
          <Menu
            value={this.props.value}
            id={id}
            onClick={(id) => {
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
        key={index}
        onClick={() => {
          if (this.props.onClick) {
            this.props.onClick(id);
          }
        }}
      >
        <span>
          {this.props.titleService
            ? this.props.titleService.getTitle(title)
            : title}
        </span>
      </a>
    );
  }
}
