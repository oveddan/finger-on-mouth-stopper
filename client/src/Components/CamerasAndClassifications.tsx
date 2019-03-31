import React, { Dispatch } from 'react';
import { Action } from '../actions';
import { State } from '../reducers';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { Keypoints, Labels, CameraKeypoints, CameraDatasets, CameraClassifiers, CameraFrameType, CameraClassifications } from '../types';
import { CamerasStatus } from '../serverApi';
import Classifications from './Classifications';
import Pose from './Pose';
import VideoPlayer from './VideoPlayer';
import PoseClassifier from './PoseClassifier';

interface Props {
  cameras: CamerasStatus,
  cameraDatasets: CameraDatasets,
  activities: Labels,
  cameraKeypoints: CameraKeypoints,
  classifications: CameraClassifications,
  clearDataset: (cameraId: number) => void,
  addLabel: (text: string) => void,
  updateLabel: (id: number, text: string) => void,
  addExample: (clasId: number, cameaId: number) => void,
  deleteExample: (classId: number, example: number, cameraId: number) => void,
  frameUpdated: (cameraId: number, frame: CameraFrameType, time: number) => void
}

const CamerasAndClassifications = (props: Props) => (
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
                activities={props.activities}
                classId={props.classifications[cameraId]}
                addLabel={props.addLabel}
                updateLabel={props.updateLabel}
              />
            </div>
          </div>
        </div>
      )
    }))}
  </div>
)

const mapStateToProps = ({cameras, cameraClassifiers, cameraDatasets, activities, cameraKeypoints, classifications}: State) => ({
  cameras, cameraDatasets, activities, cameraKeypoints, cameraClassifiers, classifications
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  deleteExample: (classId: number, cameraId: number, exampleId: number) => dispatch(actions.deleteExample(classId, cameraId, exampleId)),
  clearDataset: (cameraId: number) => dispatch(actions.clearDataset(cameraId)),
  addLabel: (text: string) => dispatch(actions.addLabel(text)),
  updateLabel: (id: number, text: string) => dispatch(actions.updateLabel(id, text)),
  addExample: (id: number, cameraId: number) => dispatch(actions.addExample(id, cameraId)),
  frameUpdated: (cameraId: number, frame: CameraFrameType, time: number) => dispatch(actions.frameUpdated(cameraId, frame, time))
});


export default connect(mapStateToProps, mapDispatchToProps)(CamerasAndClassifications);

