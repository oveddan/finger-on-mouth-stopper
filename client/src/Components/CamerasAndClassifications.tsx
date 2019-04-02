import React from 'react';
import { State } from '../reducers';
import { connect } from 'react-redux';
import * as actions from '../actions/activityActions';
import { CameraKeypoints, CameraDatasets, CameraFrameType, CameraClassifications, RootAction, CameraActivities } from '../types';
import { CamerasStatus } from '../serverApi';
import Classifications from './Classifications';
import Pose from './Pose';
import VideoPlayer from './VideoPlayer';
import ActivityEnforcer from './ActivityEnforcer';

interface Props {
  cameras: CamerasStatus,
  cameraDatasets: CameraDatasets,
  activities: CameraActivities,
  cameraKeypoints: CameraKeypoints,
  classifications: CameraClassifications,
  clearDataset: (cameraId: number) => void,
  addLabel: (cameraId: number, text: string) => void,
  updateLabel: (cameraId: number, id: number, text: string) => void,
  addExample: (clasId: number, cameaId: number) => void,
  deleteExample: (classId: number, example: number, cameraId: number) => void,
  frameUpdated: (cameraId: number, frame: CameraFrameType, time: number) => void
}

const CamerasAndClassifications = (props: Props) => (
  <div>
    <ActivityEnforcer />
    <div className="row">
      {(Object.keys(props.cameras).map(id=> {
        const cameraId = +id;
        return (
          <div className="col-6" key={cameraId}>
            <h2>{props.cameras[cameraId].name}</h2>
              <div className="row">
                <VideoPlayer
                  frameChanged={(frame) => props.frameUpdated(cameraId, frame, new Date().getTime())}
                    cameraId={cameraId}
                    camera={props.cameras[cameraId]}
                />
            </div>
            <div className="row">
              <div className="col-sm">
                <Pose keypoints={props.cameraKeypoints[cameraId]} boxes={[]} width={200} height={200*480/640}/>
              </div>
              <div className="col-sm">
                <Classifications
                  cameraId={cameraId}
                  addExample={(classId) => props.addExample(classId, cameraId)}
                  deleteExample={(classId, example) => props.deleteExample(classId, example, cameraId)}
                  clearDataset={() => props.clearDataset(cameraId)}
                  dataset={props.cameraDatasets[cameraId]}
                  activities={props.activities[cameraId]}
                  classification={props.classifications[cameraId]}
                  addLabel={label => props.addLabel(cameraId, label)}
                  updateLabel={(id, text) => props.updateLabel(cameraId, id, text)}
                />
              </div>
            </div>
          </div>
        )
      }))}
    </div>
  </div>
)

const mapStateToProps = ({activities: {cameras, cameraClassifiers, cameraDatasets, activities, cameraKeypoints, classifications}}: State) => ({
  cameras, cameraDatasets, activities, cameraKeypoints, cameraClassifiers, classifications
});

const mapDispatchToProps = {
  deleteExample: actions.deleteExample,
  clearDataset: actions.clearDataset,
  addLabel: actions.addLabel,
  updateLabel: actions.updateLabel,
  addExample: actions.addExample,
  frameUpdated: actions.frameUpdated
};

export default connect(mapStateToProps, mapDispatchToProps)(CamerasAndClassifications);

