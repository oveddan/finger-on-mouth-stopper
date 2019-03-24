import React, { Component } from 'react';
import './App.css';
import * as posenet from "@tensorflow-models/posenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as tf from '@tensorflow/tfjs';
import { loadClassifierFromLocalStorage, saveClassifierInLocalStorage } from './classifierStorage';
import { Tensor2D } from '@tensorflow/tfjs';
import { async } from 'q';
import Pose from './Pose';
import VideoPlayer from './VideoPlayer';

const poseClasses = ['withFingerOnMouth', 'coding'];

const poseClassIds: {[className: string]: number} = poseClasses.reduce(
    (result: {[className: string]: number}, poseClass, index): {[className: string]: number} => {
      result[poseClass] = index;
      return result;
    }, {});

type ClassExampleCount = {[classId: number]: number};

const getClass = (label: string) => {
  return poseClassIds[label];
};

class App extends Component {
  endAddingExampleTimeout?: number;
  classifier: knnClassifier.KNNClassifier = knnClassifier.create();

  state: {
    posenetModel?: posenet.PoseNet,
    videoLoaded: boolean,
    classId: number,
    addingExample: number | null,
    classExampleCount: ClassExampleCount,
    videoPlaying: boolean,
    keypoints?: [number, number][],
    videoSource:  {
      liveVideo: boolean,
      videoUrl?: string
    }
  } = {
    videoLoaded: false,
    classId: -1,
    addingExample: null,
    classExampleCount: {},
    videoPlaying: false,
    videoSource: {
      liveVideo: false,
    }
  };

  async componentDidMount() {
    const posenetModel = await posenet.load();

    this.loadClassifier();

    this.setState({
      posenetModel,
    })
  }

  loadClassifier() {
    loadClassifierFromLocalStorage(this.classifier);
    this.setState({
      classExampleCount: this.classifier.getClassExampleCount()
    });
  }

  async saveClassifier() {
    saveClassifierInLocalStorage(this.classifier);
  }

  estimateKeypoints = async (video: HTMLVideoElement) => {
    if (this.state.posenetModel) {
      const keypoints = await estimateAndNormalizeKeypoints(
        this.state.posenetModel,
        video
      );

      this.setState({keypoints});

      this.updateClassification();
    }
  }

  addExample = async (label: string) => {
    const classId = getClass(label);

    if (this.endAddingExampleTimeout) {
      window.clearTimeout(this.endAddingExampleTimeout);
    }

    this.setState({
      addingExample: classId
    });

    const keypointsTensor = this.getKeypointsTensor();

    if (keypointsTensor) {
      this.classifier.addExample(keypointsTensor, classId);
      keypointsTensor.dispose();

      this.saveClassifier();
    }

    this.endAddingExampleTimeout = window.setTimeout(() => {
      const classExampleCount = this.classifier.getClassExampleCount();

      this.setState({
        addingExample: null,
        classExampleCount
      });
    }, 200);
  }

  numberExamples() {
    return Object.values(this.state.classExampleCount).reduce((sum, count) => sum + count, 0);
  }

  updateClassification = async() => {
    const classId = await this.classify();

    this.setState({
      classId
    });
  }

  classify = async() => {
    if (this.numberExamples() === 0) return;

    const keypointsTensor = this.getKeypointsTensor();

    if (!keypointsTensor)
      return;

    const prediction = await this.classifier.predictClass(keypointsTensor);

    keypointsTensor.dispose();

    return prediction.classIndex;
  }

  resetClassifier = () => {
    this.classifier.clearAllClasses();
    this.saveClassifier();
    this.setState({
      classExampleCount: this.classifier.getClassExampleCount()
    })
  }

  getButtonClass = (poseClass: string, poseClassIndex: number) => {
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

  getKeypointsTensor(): Tensor2D | undefined {
    if (!this.state.keypoints)
      return undefined;

    return tf.tensor2d(this.state.keypoints);
  }

  frameChanged = this.estimateKeypoints

  render() {
    const { classExampleCount } = this.state;
    return (
      <div className="App container-fluid">
        <h1>Pose Classifier</h1>
        <div className="row">
          <div className="col-sm">
            <h2>Video</h2>
            <VideoPlayer frameChanged={this.frameChanged}  />
         </div>
          <div className="col-sm">
            <h3>Pose</h3>
            <Pose keypoints={this.state.keypoints} width={200} height={200*480/640}/>
            <h3>Classifications (number examples)</h3>
            <h5>Click a classification to add an example from the pose of the current frame</h5>
              {(
                poseClasses.map((poseClass, id) => (
                  <button key={id}
                    className={`btn ${this.getButtonClass(poseClass, id)}`}
                    onClick={() => this.addExample(poseClass)} >
                    {`${poseClass} (${classExampleCount[id] || 0})`}
                  </button>
                ))
              )}
            <ul className="list-unstyled">
              <h3>Actions</h3>
              <li>
                <button onClick={this.resetClassifier}>Reset classifier</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

const estimateAndNormalizeKeypoints = async (
  posenetModel: posenet.PoseNet,
  video: HTMLVideoElement): Promise<number[][] | undefined> => {
  const poses = await posenetModel.estimateMultiplePoses(video);
  if (poses.length === 0) {
    return undefined;
  }

  return poses[0].keypoints.map(p => ([p.position.x / video.width, p.position.y / video.height] ));
}

export default App;
