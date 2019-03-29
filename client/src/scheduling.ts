import moment from 'moment';

export type ScheduleEntry = {
  start: moment.Moment,
  end: moment.Moment,
  description: string
}

export type Schedule = ScheduleEntry[];

export type Task = {
  name: string,
  weight: number,
  requiredPrecedent?: string
}

export type SchedulingParams = {
  startTime: moment.Moment,
  endTime: moment.Moment,
  entryDurationMinutes: number,
  tasks: Task[]
};

export const generateSchedule = ({startTime, endTime, entryDurationMinutes, tasks} : SchedulingParams): Schedule => {
  const minutesElapsed = moment.duration(endTime.diff(startTime)).as('minutes');


  const sumWeights = tasks.reduce((sum, {weight}) => sum + weight, 0);

  const percentages = tasks.map(({weight}) => weight / sumWeights);

  const durations = percentages.map(percentage => Math.floor(percentage * minutesElapsed))

  const taskCounts = durations.map(duration => Math.floor(duration / entryDurationMinutes));

  const taskDurations = taskCounts.reduce((sum, x) => x*entryDurationMinutes + sum, 0);
  const remainingTime = minutesElapsed - taskDurations;

  const remainingBuckets = Math.floor(remainingTime / entryDurationMinutes);

  const tasksForCounts: number[] = taskCounts.reduce((result: number[], taskCount, taskId): number[] => {
    for(let i = 0; i < taskCount; i++) {
      result.push(taskId);
    }
    return result;
  }, []);

  for(let i = 0; i <= remainingBuckets; i++) {
    const randomTask = Math.floor(Math.random() * tasks.length);
    tasksForCounts.push(randomTask);
  }

  shuffle(tasksForCounts);

  return tasksForCounts.reduce((result: Schedule, taskId): Schedule => {
    const description = tasks[taskId].name;
    const lastTask = result[result.length - 1];
    const start = lastTask ? lastTask.end : startTime;
    const end = start.clone().add(entryDurationMinutes, 'minutes');

    const task = {
      description,
      start,
      end
    };

    return [...result, task]
  }, []);
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