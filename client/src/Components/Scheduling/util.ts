import * as moment from 'moment';
import {Schedule, ScheduleActivity, ScheduleEntry} from '../../types';
import {indexByOrder} from '../../util';

export type Task = {
  name: string,
  weight: number,
  cameraId: number,
  classId: number,
  requiredPrecedent?: Task
}

export type SchedulingParams = {
  startTime: moment.Moment,
  endTime: moment.Moment,
  entryDurationMinutes: number,
  tasks: Task[]
};

const toActivity = ({cameraId, classId}: Task): ScheduleActivity =>
    ({cameraId, classId});

export const generateRandomSchedule =
    ({startTime, endTime, entryDurationMinutes, tasks}: SchedulingParams):
        Schedule => {
          const minutesElapsed =
              moment.duration(endTime.diff(startTime)).as('minutes');

          const sumWeights = tasks.reduce((sum, {weight}) => sum + weight, 0);

          const percentages = tasks.map(({weight}) => weight / sumWeights);

          const durations = percentages.map(
              percentage => Math.floor(percentage * minutesElapsed))

          const taskCounts = durations.map(
              duration => Math.floor(duration / entryDurationMinutes));

          const taskDurations =
              taskCounts.reduce((sum, x) => x * entryDurationMinutes + sum, 0);
          const remainingTime = minutesElapsed - taskDurations;

          const remainingBuckets =
              Math.floor(remainingTime / entryDurationMinutes);

          const tasksForCounts: number[] = taskCounts.reduce(
              (result: number[], taskCount, taskId): number[] => {
                for (let i = 0; i < taskCount; i++) {
                  result.push(taskId);
                }
                return result;
              }, []);

          for (let i = 0; i <= remainingBuckets; i++) {
            const randomTask = Math.floor(Math.random() * tasks.length);
            tasksForCounts.push(randomTask);
          }

          shuffle(tasksForCounts);

          const entries = tasksForCounts.reduce(
              (result: ScheduleEntry[], taskId): ScheduleEntry[] => {
                const lastTask = result[result.length - 1];
                const start = lastTask ? lastTask.end : startTime;
                const end = start.clone().add(entryDurationMinutes, 'minutes');

                const activity: ScheduleActivity = toActivity(tasks[taskId]);
                const task: ScheduleEntry = {activity, start, end};

                return [...result, task]
              }, []);

          return indexByOrder(entries);
        }

function shuffle(array: any[]) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
}

// export const generateScheduleForNow =
//     () => {
//       const startTime = moment().startOf('day').add(8, 'hour');
//       const endTime = startTime.clone().add(1, 'hour');

//       const entryDurationMinutes = 5;

//       const tasks: Task[] = [
//         {
//           name: 'sit at computer',
//           weight: 25,
//         },
//         {
//           name: 'shower',
//           weight: 10,
//         },
//         {
//           name: 'eat breakfast',
//           weight: 15,
//         },
//         {name: 'get dressed', weight: 15, requiredPrecedent: 'shower'},
//         {name: 'stretch', weight: 15}, {name: 'look at phone', weight: 10}
//       ];

//       const schedule =
//           generateSchedule({startTime, endTime, entryDurationMinutes,
//           tasks});

//       return schedule;
//     }

export const formatTime = (time: moment.Moment) => time.format('LT');
