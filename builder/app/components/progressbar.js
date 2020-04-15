/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
// @flow
import React, { Component } from 'react';
import * as styles from './progressbar.scss';

export default class ProgressBar extends Component {
  static formatTime(time) {
    let result = time;
    if (time > 1000) {
      result = `${(time / (1000)).toFixed(2)}s`;
      if (time > 60 * 1000) {
        result = time / 60000;
        result = `${(time / (60 * 1000).toFixed(2))}m`;
        if (time > 60 * 1000 * 60) {
          result = `${(time / (60 * 1000 * 60)).toFixed(2)}h`;
        }
      }
    }
    return result;
  }

  getSteps() {
    const { steps } = this.props;
    const result = [];
    if (steps) {
      let allDone = true;
      steps.map((step, stepIndex) => {
        const { name, complete, activate, progress, estimateRemaining, totalTime } = step;
        let percentage = progress ? progress.toFixed() : '0.00';
        let timeLeft = estimateRemaining ? ProgressBar.formatTime(estimateRemaining) : '';
        const totalTimeUsed = totalTime ? ProgressBar.formatTime(totalTime) : '';
        if (complete) {
          percentage = '100';
          timeLeft = '';
        }
        allDone = allDone && complete;
        result.push(<li key={`stepIndex${stepIndex}`} title={`${name}`} className={`${activate ? styles.active : ''} ${complete ? styles.completed : ''}`}>
          <span className={`${styles.bubble}`} />{name} <div>{percentage}% </div><div>{timeLeft}</div>
          <div className={styles.totalTimeUsed}>{totalTimeUsed}</div>
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