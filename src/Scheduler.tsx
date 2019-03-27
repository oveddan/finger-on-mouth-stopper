import React, { Component } from "react";
import { generateSchedule, Task, Schedule } from "./scheduling";
import moment from 'moment';

export default class Scheduler extends Component {
  state: {
    schedule?: Schedule 
  } = {

  };

  generateSchedule = () => {
    const startTime = moment().startOf('day').add(8, "hour").add(45, "minute");
    const endTime = startTime.clone().add(1, "hour");

    const entryDurationMinutes = 5;

    const tasks: Task[] = [{
      name: 'sit at computer',
      weight: 25,
    }, {
      name: 'shower',
      weight: 10,
    }, {
      name: 'eat breakfast',
      weight: 20,
    }, {
      name: 'get dressed',
      weight: 10,
      requiredPrecedent: 'shower'
    }, {
      name: 'stretch',
      weight: 10
    }, {
      name: 'look at phone',
      weight: 15
    }];

    const schedule = generateSchedule({
      startTime,
      endTime,
      entryDurationMinutes,
      tasks
    });

    this.setState({
      schedule
    });
 }

 startOver = () => {
   this.setState({schedule: undefined});
 }
  
  render() {
      return (
        <div>
          <h1>Scheduler</h1>
          <div className="row">
            <div className="col-sm">
              {!this.state.schedule && (
                <button className='btn btn-primary' onClick={this.generateSchedule}>Generate schedule </button>
              )}
              {this.state.schedule && (
                <div>
                  {this.state.schedule.map((entry, i) => (
                    <p key={i}>{`${entry.description}: ${formatTime(entry.start)} - ${formatTime(entry.end)}`}</p> 
                  ))}
                  <button className='btn btn-secondary' onClick={this.startOver}>Start over</button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
  }
}

const formatTime = (time: moment.Moment) => time.format("LT")