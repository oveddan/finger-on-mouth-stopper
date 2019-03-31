import React, { Component, Dispatch } from 'react';
import { Action } from '../actions';
import { State } from '../reducers';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { Keypoints, Labels, CameraKeypoints, CameraDatasets, CameraClassifiers } from '../types';
import { PoseClassifier } from './PoseClassifier';

interface PoseClassifiersProps {
  cameras: string[],
  cameraDatasets: CameraDatasets,
  cameraClassifiers: CameraClassifiers,
  activities: Labels,
  cameraKeypoints: CameraKeypoints,
  clearDataset: (cameraId: number) => void,
  addLabel: (text: string) => void,
  updateLabel: (id: number, text: string) => void,
  keypointsEstimated: (keypoints: Keypoints, cameraId: number) => void
  addExample: (clasId: number, cameaId: number) => void,
  deleteExample: (classId: number, example: number, cameraId: number) => void
}

const PoseClassifiers = (props: PoseClassifiersProps) => (
  <div className="row">
    {(props.cameras.map((camera, cameraId) => (
      <div className="col-6">
        <PoseClassifier
          key={cameraId}
          classifier={props.cameraClassifiers[cameraId]}
          cameraId={cameraId}
          cameraName={camera}
          dataset={props.cameraDatasets[cameraId]}
          activities={props.activities}
          keypoints={props.cameraKeypoints[cameraId]}
          clearDataset={() => props.clearDataset(cameraId)}
          addLabel={props.addLabel}
          updateLabel={props.updateLabel}
          keypointsEstimated={(keypoints) => props.keypointsEstimated(keypoints, cameraId)}
          addExample={(classId) => props.addExample(classId, cameraId)}
          deleteExample={(classId, example) => props.deleteExample(classId, example, cameraId)}
        />
      </div>
    )))}
  </div>
)

const mapStateToProps = ({cameras, cameraClassifiers, cameraDatasets, activities, cameraKeypoints}: State) => ({
  cameras, cameraDatasets, activities, cameraKeypoints, cameraClassifiers
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  deleteExample: (classId: number, cameraId: number, exampleId: number) => dispatch(actions.deleteExample(classId, cameraId, exampleId)),
  clearDataset: (cameraId: number) => dispatch(actions.clearDataset(cameraId)),
  addLabel: (text: string) => dispatch(actions.addLabel(text)),
  updateLabel: (id: number, text: string) => dispatch(actions.updateLabel(id, text)),
  addExample: (id: number, cameraId: number) => dispatch(actions.addExample(id, cameraId)),
  keypointsEstimated: (keypoints: Keypoints, cameraId: number) => dispatch(actions.keypointsEstimated(keypoints, cameraId))
});


export default connect(mapStateToProps, mapDispatchToProps)(PoseClassifiers);

