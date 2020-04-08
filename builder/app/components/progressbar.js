/* eslint-disable no-unused-expressions */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
// @flow
import React, { Component } from 'react';
import * as styles from './progressbar.scss';

export default class ProgressBar extends Component {
  getSteps() {
    const { steps } = this.props;
    const result = [];
    if (steps) {
      let allDone = true;
      steps.map((step) => {
        const { name, complete, activate, progress } = step;
        let percentage = progress ? progress.toFixed() : '0.00';
        if (complete) {
          percentage = '100';
        }
        allDone = allDone && complete;
        result.push(<li title={`${name}`} className={`${activate ? styles.active : ''} ${complete ? styles.completed : ''}`}>
          <span className={`${styles.bubble}`} />{name} {percentage}%
          <progress value={complete ? 100 : (activate ? (progress || 1) : 0)} min={0} max={100} />
        </li>);
      });
      result.push(<li className={`${allDone ? styles.completed : ''}`}> <span className={`${styles.bubble}`} />Done</li>)
    }
    return result;
  }

  render() {
    return (<div className={styles.container}>
      <ul className={styles.progressbar}>
        {this.getSteps()}
      </ul>
    </div>)
  }
}
