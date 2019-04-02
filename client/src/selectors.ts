import {valueAndGrads} from '@tensorflow/tfjs';
import * as moment from 'moment';
import {createSelector} from 'reselect';

import {State} from './reducers';
import {ComplianceStatus, Schedule, ScheduleActivity, ScheduleEntry} from './types';

const schedule = (state: State) => state.scheduling.schedule

const time = (state: State) => state.scheduling.currentTime

const timeOverlapses = (scheduleEntry: ScheduleEntry, time: moment.Moment) => {
  return time.diff(scheduleEntry.start) > 0 && scheduleEntry.end.diff(time) > 0;
};

const classifications = (state: State) => state.activities.classifications

const activityLabels = (state: State) => state.activities.activities

const findCurrentScheduleEntry =
    (schedule: Schedule, time: moment.Moment): ScheduleEntry|undefined => {
      return Object.values(schedule).find(
          scheduleEntry => timeOverlapses(scheduleEntry, time));
    };

export const currentScheduledEntry =
    createSelector([schedule, time], (schedule, time) => {
      if (!schedule) {
        return undefined;
      }
      return findCurrentScheduleEntry(schedule, time);
    });


export type ScheduledEntryAndActivity = {
  scheduleEntry: ScheduleEntry,
  activity: string
};

export const currentScheduledEntryAndActivityName = createSelector(
    [currentScheduledEntry, activityLabels],
    (scheduleEntry, activityLabels) => {
      if (!scheduleEntry) return;

      const activity =
          activityLabels[scheduleEntry.activity.cameraId][scheduleEntry.activity
                                                              .classId];

      return {scheduleEntry, activity};
    });

export const scheduledEntryTimeRemaining =
    createSelector([currentScheduledEntry, time], (scheduledEntry, time) => {
      if (!scheduledEntry) return;

      return moment.duration(scheduledEntry.end.diff(time))
    })

export type ClassificationWithLabel = {
  classId: number,
  score: number,
  label: string,
  cameraId: number
}

export const classificationsWithLabels = createSelector(
    [classifications, activityLabels],
    (classifications, activityLabels): (ClassificationWithLabel|null)[] => {
        return Object.entries(classifications).map(([id, classification]) => {
          if (!classification) return null;
          const cameraId = +id;

          return {
            ...classification, cameraId,
                label: activityLabels[cameraId][classification.classId]
          }
        })});


function max<T>(values: T[], predicate: (value: T|null) => number): T|
    undefined {
  const result = values.reduce((result: T|undefined, value): T => {
    if (!result) return value;

    if (predicate(value) > predicate(result))
      return value;
    else
      return result;
  }, undefined)

  return result;
}

export const highestConfidenceClassification = createSelector(
    [classificationsWithLabels],
    (classificationsWithLabels): ClassificationWithLabel|null|undefined => {
      return max(
          classificationsWithLabels,
          (value) => value !== null ? value.score : -1);
    });

export const complianceStatus = createSelector(
    [currentScheduledEntry, highestConfidenceClassification],
    (scheduledActivity, classification): ComplianceStatus => {
      if (!scheduledActivity) return ComplianceStatus.NO_ACTIVITY_SCHEDULED;

      if (!classification) return ComplianceStatus.NOT_SURE;

      const {activity} = scheduledActivity;

      if (classification.cameraId !== activity.cameraId ||
          classification.classId !== activity.classId) {
        return ComplianceStatus.NOT_COMPLYING;
      }

      return ComplianceStatus.COMPLYING;
    });
