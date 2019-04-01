import {action} from 'typesafe-actions';

import {SCHEDULE_CLEARED, SCHEDULE_CREATED} from '../constants';
import {Schedule} from '../types';

export const createSchedule = (schedule: Schedule) =>
    action(SCHEDULE_CREATED, schedule)

export const clearSchedule = () => action(SCHEDULE_CLEARED)
