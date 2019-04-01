import React, { Component } from 'react';
import * as actions from '../activityActions';

import * as batchPoseNet from '../batchPoseNet';

import { Keypoints, CameraFrameType, CameraDatasets, CameraClassifiers, CameraKeypoints, CameraFrames } from '../types';

import { State } from '../reducers';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { performPoseEstimation, classify } from '../estimation';

interface Props {
  cameraDatasets: CameraDatasets,
  cameraClassifiers: CameraClassifiers,
  frames:  {
    [cameraId: number]: {
      frame: CameraFrameType,
      updateTime: number
    }
  },
  keypointsEstimated: (keypoints: CameraKeypoints) => void,
  poseClassified: (cameraId: number, classId: number | null) => void
};

class Classifier extends Component<Props> {

  endAddingExampleTimeout?: number;
  performingEstimation: boolean = false;
  awaitingEstimationFinished: boolean = false;

  state: {
    posenetModel?: batchPoseNet.BatchPoseNet,
    awaitingEstimation: boolean
  } = {
    awaitingEstimation: false
  };

  async componentDidMount() {
    const net = await batchPoseNet.load(1.00);

    this.setState({posenetModel: net})

    this.estimateKeypointsAndClassify();
  }


  estimateKeypointsAndClassify = async () =>  {
    this.performingEstimation = true;
    this.awaitingEstimationFinished = false;


    const cameraKeypoints = await this.performPoseEstimation();

    try {
      await Promise.all(Object.keys(cameraKeypoints).map(async id => {
        const keypoints = cameraKeypoints[+id];
        if (!keypoints) return null;

        return await this.performClassification(+id, keypoints);
      }));

      this.performingEstimation = false;

      if (this.awaitingEstimationFinished) {
        await this.estimateKeypointsAndClassify();
      }
    } catch(e) {
      console.error(e);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.frames !== this.props.frames) {
      if (this.performingEstimation) {
        this.awaitingEstimationFinished = true;
      } else {
        this.estimateKeypointsAndClassify();
      }
    }
  }

  async performPoseEstimation(): Promise<CameraKeypoints> {
    if (!this.state.posenetModel)
      return {};

    const results = await performPoseEstimation(this.state.posenetModel, this.props.frames);

    this.performingEstimation = false;

    this.props.keypointsEstimated(results);


    return results;
  }

  async performClassification(cameraId: number, keypoints: Keypoints) {
    const classifier = this.props.cameraClassifiers[cameraId];
    const dataset = this.props.cameraDatasets[cameraId];
    if (classifier && dataset) {
      const classId = await classify(classifier, dataset, keypoints);

      this.props.poseClassified(cameraId, classId);
    }
  }

  render() {
    return (
      <div>
        {Object.values(this.props.frames).map(frame => (
          <div>{frame.updateTime}</div>
        ))}
      </div>
    )
  }
}

const mapStateToProps = ({activities: {cameraClassifiers, cameraDatasets, frames}}: State) => ({
  cameraDatasets, cameraClassifiers, frames
});

const mapDispatchToProps = {
  keypointsEstimated: actions.keypointsEstimated,
  poseClassified: actions.poseClassified
};

export default connect(mapStateToProps, mapDispatchToProps)(Classifier);

