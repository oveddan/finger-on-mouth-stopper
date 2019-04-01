import React from 'react';
import { CameraActivities, ScheduleActivity, Activity, Schedule } from "../../types";
import { CamerasStatus } from "../../serverApi";
import { formatTime } from "./util";

type Props = {
  schedule: Schedule,
  cameraActivities: CameraActivities,
  cameras: CamerasStatus
}

const getActivity = (scheduleActivity: ScheduleActivity, cameraActivities: CameraActivities): Activity => {
  const activities = cameraActivities[scheduleActivity.cameraId] || {};

  return activities[scheduleActivity.classId];
};

const getActivityDescription = (scheduleActivity: ScheduleActivity, cameraActivities: CameraActivities, cameras: CamerasStatus) => (
  {
    activity: getActivity(scheduleActivity, cameraActivities),
    camera: (cameras[scheduleActivity.cameraId] || {}).name
  }
);

const ScheduleViewer = ({ schedule, cameraActivities, cameras }: Props) => (
  <div>
    {Object.values(schedule).map((entry, i) => {
      const { activity, camera }= getActivityDescription(entry.activity, cameraActivities, cameras);
      return <p key={i}>{`${activity} (in the ${camera}): ${formatTime(entry.start)} - ${formatTime(entry.end)}`}</p>
    })}
  </div>
  )

export default ScheduleViewer
