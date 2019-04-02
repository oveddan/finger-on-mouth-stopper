import React, { useState } from 'react';
import { generateRandomSchedule, Task, SchedulingParams } from './util';
import { CameraActivities, Schedule } from '../../types';
import { CamerasStatus } from '../../serverApi';
import * as moment from 'moment';
import DatePicker from 'react-date-picker';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import Slider from 'rc-slider';

type Props = {
  activities: CameraActivities,
  cameras: CamerasStatus,
  createSchedule: (schedule: Schedule) => void,
}

type startDayOptions = 'today'| 'tomorrow';

type State = {
  startDay: startDayOptions,
  startTimeOfDay: moment.Moment,
  endTime: moment.Moment,
  entryDurationMinutes: number,
  tasks: Task[]
};

const format = 'h:mm a';

const ScheduleCreator = ({createSchedule, cameras, activities}: Props) => {
  const [state, setState] = useState<State>({
    startTimeOfDay: moment.default(),
    startDay: 'today',
    endTime: moment.default().add(2, 'hour'),
    entryDurationMinutes: 5,
    tasks: generateInitialTasks(cameras, activities)
  });

  const dayChanged = (startDay: startDayOptions) => setState({...state, startDay});

  const startTimeChanged = (newTime: moment.Moment) => setState({
    ...state,
    startTimeOfDay: newTime,
    endTime: state.endTime.clone().add(newTime.diff(state.startTimeOfDay))
  })

  const updateWeight = (taskId: number, weight: number) => setState({
    ...state,
    tasks: updateTaskWeight(state.tasks, taskId, weight)
  });

  return (
    <div className="row">
      <div className='col-sm-4'>
        <form>
          <div className="form-group">
            <label>Start Time</label>
            <div className='input-group'>
              <select onChange={e => dayChanged(e.target.value as startDayOptions)} className='form-control form-control-sm'>
                <option value='today'>Today</option>
                <option value='tomorrow'>Tomorrow</option>
              </select>
              <TimePicker
                showSecond={false}
                value={state.startTimeOfDay}
                onChange={value => startTimeChanged(value)}
                format={format}
                use12Hours
                inputReadOnly
              />
            </div>
          </div>
          <div className='form-group'>
            <label>End Time</label><br/>
            <TimePicker
              showSecond={false}
              value={state.endTime}
              onChange={value => setState({...state, endTime: value})}
              className='xxx'
              format={format}
              use12Hours
              inputReadOnly
            />
          </div>
          <div className='form-group'>
            <label>Duration per schedule entry (in minutes)</label>
            <input type='number'
              className='form-control form-control-sm'
              value={state.entryDurationMinutes}
              onChange={e => setState({...state, entryDurationMinutes: +e.target.value})}
              min={0}
              max={60}
            />
          </div>
          <div className='form-group'>
            <h5>Things to do during this time:</h5>
              {state.tasks.map((task, i) => (
                <TaskView key={i} task={task} updateWeight={weight => updateWeight(i, weight)} />
              ))}
          </div>
          <button className='btn btn-primary'
            onClick={() => createSchedule(generateRandomSchedule(toSchedulingParams(state)))}>
              Generate schedule
          </button>
        </form>
      </div>
    </div>
  );
}

const TaskView = ({ task, updateWeight } : {task: Task, updateWeight: (weight: number) => void}) => (
  <div>
    <label>{task.name}</label>
    <input type='range' className='custom-range' value={task.weight} min={0} max={100} step={1} onChange={({target})=> updateWeight(+target.value)}></input>
  </div>
);

const updateTaskWeight = (tasks: Task[], taskId: number, weight: number): Task[] => tasks.map((task, id): Task => {
  if (id === taskId) {
    return {
      ...task,
      weight
    };
  }
  return task;
});

const daysToAdd = (startDay: startDayOptions) => (startDay === 'today' ? 0 : 1);

const addTimeOfDay = (original: moment.Moment, toAdd: moment.Moment) => (
  original.clone().add(toAdd.hour(), 'hour').add(toAdd.minute(), 'minute')
)

const toSchedulingParams = (state: State): SchedulingParams => {
  const startDay = moment.default().startOf('day').add(daysToAdd(state.startDay), 'day');
  const startTime = addTimeOfDay(startDay, state.startTimeOfDay);
  const endTime = addTimeOfDay(startDay, state.endTime);

  return {
    startTime,
    endTime,
    entryDurationMinutes: state.entryDurationMinutes,
    tasks: state.tasks
  };
};

const generateInitialTasks = (cameras: CamerasStatus, cameraActivities: CameraActivities): Task[] => (
  Object.entries(cameraActivities).map(([cameraId, activitiesOfCamera]) => (
    Object.entries(activitiesOfCamera).map(([classId, activity]): Task => ({
      name: `${activity} (in the ${cameras[+cameraId].name})`,
      weight: 0,
      cameraId: +cameraId,
      classId: +classId
    }))
  )).flatMap(task => task)
);

export default ScheduleCreator
