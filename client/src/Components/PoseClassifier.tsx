import React, { Component } from 'react';
import * as posenet from "@tensorflow-models/posenet";
import * as tf from '@tensorflow/tfjs';

import Pose from './Pose';
import VideoPlayer from './VideoPlayer';
import Classifications from './Classifications';
import EditableClassifications from './EditableClassifications';
import { toExample } from '../util';
import { DatasetObject, Keypoint, Keypoints, Labels } from '../types';
import { KNNClassifier } from '@tensorflow-models/knn-classifier';

interface PoseClassifierProps {
  cameraName: string,
  classifier?: KNNClassifier,
  cameraId: number,
  dataset?: DatasetObject,
  activities: Labels,
  keypoints?: Keypoints,
  clearDataset: () => void,
  addLabel: (text: string) => void,
  updateLabel: (id: number, text: string) => void,
  keypointsEstimated: (keypoints: Keypoints) => void
  addExample: (clasId: number) => void,
  deleteExample: (classId: number, example: number) => void
};

export class PoseClassifier extends Component<PoseClassifierProps> {
  endAddingExampleTimeout?: number;

  state: {
    posenetModel?: posenet.PoseNet,
    videoLoaded: boolean,
    classId: number,
    addingExample: number | null,
    videoPlaying: boolean,
    editingClassifications: boolean,
    videoSource:  {
      liveVideo: boolean,
      videoUrl?: string
    },
  } = {
    videoLoaded: false,
    classId: -1,
    addingExample: null,
    videoPlaying: false,
    editingClassifications: false,
    videoSource: {
      liveVideo: false,
    }
  };

  async componentDidMount() {
    const posenetModel = await posenet.load(1.00);

    this.setState({posenetModel});
  }

  addExample = (classId: number) => {
    this.setState({
      addingExample: classId
    });

    if (this.endAddingExampleTimeout) {
      window.clearTimeout(this.endAddingExampleTimeout);
    }

    this.props.addExample(classId);

    setTimeout(() => {
      this.endAddingExampleTimeout = window.setTimeout(() => {
        this.setState({
          addingExample: null,
        });
      }, 200);
    });
  }

  deleteExample = (classId: number, example: number): void => {
    this.props.deleteExample(classId, example);
  }

  updateClassification = () => {
    setTimeout(async () => {
      if (!this.props.classifier || !this.props.dataset) return;

      const classId = await classify(this.props.classifier, this.props.dataset, this.props.keypoints);

      this.setState({
        classId
      });
    });

  }

  estimateKeypoints = async (video: HTMLVideoElement | HTMLImageElement) => {
    if (this.state.posenetModel) {
      let videoTensor: tf.Tensor3D;
      try {
        videoTensor = tf.browser.fromPixels(video);
      } catch(e) {
        console.error('could not load video');
        console.error(e);
        return;
      }

      const keypoints = await estimateAndNormalizeKeypoints(this.state.posenetModel, videoTensor);

      if (keypoints) {
        this.props.keypointsEstimated(keypoints);

        this.updateClassification();
      }
    }
  }

  resetDataset = async () => {
    this.props.clearDataset();
  }

  getButtonClass = (poseClassIndex: number) => {
    const { classId, addingExample } = this.state;
    if (addingExample !== null) {
      if (poseClassIndex === addingExample) {
        return "btn-success"
      } else {
        return "btn-light"
      }
    }

    if (classId === poseClassIndex) {
      return "btn-primary"
    };

    return "btn-light";
  }

  frameChanged = this.estimateKeypoints

  toggleEditClassifications = () => {
    this.setState({editingClassifications: !this.state.editingClassifications});
  }

  render() {
    const { dataset, activities, keypoints } = this.props;
    return (
      <div>
        <h2>{this.props.cameraName}</h2>
        <div className="row">
          <div className="col-sm">
            <VideoPlayer frameChanged={this.frameChanged}  />
         </div>
          <div className="col-sm">
            <h5>Normalized Pose to Classify:</h5>
            <Pose keypoints={keypoints} boxes={[]} width={200} height={200*480/640}/>
            <h5>
              Classifications (number examples):
              {!this.state.editingClassifications && (
                <a href="#" onClick={this.toggleEditClassifications}>edit</a>
              )}
            </h5>
            {this.state.editingClassifications && (
              <div>
                <EditableClassifications
                  dataset={dataset}
                  getButtonClass={this.getButtonClass}
                  labels={this.props.activities}
                  updateLabel={this.props.updateLabel}
                  addLabel={this.props.addLabel}
                  deleteExample={this.deleteExample}
                />
              </div>
            )}
            {!this.state.editingClassifications && (
              <Classifications
                activities={activities}
                dataset={dataset}
                getButtonClass={this.getButtonClass}
                addExample={this.addExample}
              />

            )}
            {this.state.editingClassifications && (
              <a href="#" onClick={this.toggleEditClassifications}>done editing</a>
            )}
            <br /><br/>
            <button className='btn btn-light' onClick={this.resetDataset}>Reset classifier</button>

            <br/><br/>
            </div>
        </div>
      </div>
    );
  }
}

const estimateAndNormalizeKeypoints = async (
  posenetModel: posenet.PoseNet,
  video: tf.Tensor3D): Promise<Keypoints | undefined> => {
  const poses = await posenetModel.estimateMultiplePoses(video, 1, false, 8, 1);
  if (poses.length === 0) {
    return undefined;
  }

  const [ height, width ] = video.shape;

  // const boundingBox = posenet.getBoundingBox(poses[0].keypoints);
  // const width = boundingBox.maxX - boundingBox.minX;
  // const height = boundingBox.maxY - boundingBox.minY;

  // normalize keypoints to bounding box
  // return poses[0].keypoints.map(p => ([
  //   (p.position.x - boundingBox.minX) / width,
  //   (p.position.y - boundingBox.minY) / height
  // ]));
  return poses[0].keypoints.map(({position: { x, y }}): [number, number] => (
    [x / width, y / height]
  ));
}

const classify = async(classifier: KNNClassifier, dataset: DatasetObject, keypoints?: Keypoints) => {
  if (Object.keys(dataset).length === 0) return;

  if (!keypoints) return;

  const keypointsTensor = toExample(keypoints);

  const prediction = await classifier.predictClass(keypointsTensor);

  keypointsTensor.dispose();

  return prediction.classIndex;
}
