import * as moment from 'moment';
import {action} from 'typesafe-actions';

import {SCHEDULE_CLEARED, SCHEDULE_CREATED, TIME_ADVANCED} from '../constants';
import {Schedule} from '../types';

export const createSchedule = (schedule: Schedule) =>
    action(SCHEDULE_CREATED, schedule)

export const clearSchedule = () => action(SCHEDULE_CLEARED)

export const advanceTime = (time: moment.Moment) =>
    action(TIME_ADVANCED, {time});
