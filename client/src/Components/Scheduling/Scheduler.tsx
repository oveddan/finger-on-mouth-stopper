import React from "react";
import { generateRandomSchedule, Task } from "./util";
import { State } from '../../reducers';
import { CameraActivities, Schedule } from "../../types";
import { CamerasStatus } from "../../serverApi";
import * as actions from '../../actions/schedulingActions';
import { connect } from "react-redux";
import ScheduleViewer from "./ScheduleViewer";
import ScheduleCreator from "./ScheduleCreator";


type Props = {
  schedule?: Schedule,
  activities: CameraActivities,
  cameras: CamerasStatus,
  createSchedule: (schedule: Schedule) => void,
  clearSchedule: () => void
};

const Scheduler = ({schedule, activities, cameras, createSchedule, clearSchedule}: Props ) => {
  return (
    <div>
      <h1>Scheduler</h1>
      <div className="row">
        <div className="col-sm">
          {!schedule && (
            <ScheduleCreator activities={activities} cameras={cameras} createSchedule={createSchedule}/>
          )}
          {schedule && (
            <div>
              <ScheduleViewer schedule={schedule} cameraActivities={activities} cameras={cameras} />
              <button className='btn btn-secondary' onClick={clearSchedule}>Start over</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


const mapStateToProps = ({activities: {cameras, activities }, scheduling: { schedule }}: State) => ({
  cameras, activities, schedule
});

const mapDispatchToProps = {
  createSchedule: actions.createSchedule,
  clearSchedule: actions.clearSchedule
};

export default connect(mapStateToProps, mapDispatchToProps)(Scheduler);

