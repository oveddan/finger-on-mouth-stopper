import React, { Component } from 'react';
import './App.css';
import * as posenet from "@tensorflow-models/posenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as tf from '@tensorflow/tfjs';
import { loadClassifierAndLabelsFromLocalStorage, saveClassifierAndLabelsInLocalStorage } from './classifierStorage';
import { Tensor2D } from '@tensorflow/tfjs';
import { async } from 'q';
import Pose from './Pose';
import VideoPlayer from './VideoPlayer';
import Classifications, { ClassExampleCount } from './Classifications';

const defaultLabels = ['withFingerOnMouth', 'coding'];


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
    },
    labels: string[]
  } = {
    videoLoaded: false,
    classId: -1,
    addingExample: null,
    classExampleCount: {},
    videoPlaying: false,
    videoSource: {
      liveVideo: false,
    },
    labels: defaultLabels
  };

  async componentDidMount() {
    const posenetModel = await posenet.load();

    this.loadClassifier();

    this.setState({
      posenetModel,
    })
  }

  loadClassifier() {
    const labels = loadClassifierAndLabelsFromLocalStorage(this.classifier);
    const labelsToUse = !labels || labels.length === 0 ? defaultLabels : labels;

    this.setState({
      classExampleCount: this.classifier.getClassExampleCount(),
      labels: labelsToUse 
    });
  }

  saveClassifier = async () => {
    await saveClassifierAndLabelsInLocalStorage(this.classifier, this.state.labels);
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

  addExample = async (classId: number) => {
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

  updateLabel = async (classId: number, label: string | undefined) => {
    if (!label) return;
    const newLabels = this.state.labels.splice(0);

    newLabels[classId] = label;

    this.setState({
      labels: newLabels
    }, this.saveClassifier);
  }

  addLabel = async (label: string) => {
    const newLabels = this.state.labels.splice(0);

    newLabels.push(label);

    this.setState({
      labels: newLabels
    }, this.saveClassifier);
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

  resetClassifier = async () => {
    this.classifier.clearAllClasses();

    this.setState({
      labels: defaultLabels,
      classExampleCount: this.classifier.getClassExampleCount(),
    }, async () => await this.saveClassifier());
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

  getKeypointsTensor(): Tensor2D | undefined {
    if (!this.state.keypoints)
      return undefined;

    return tf.tensor2d(this.state.keypoints);
  }

  frameChanged = this.estimateKeypoints

  render() {
    const { classExampleCount, labels, keypoints } = this.state;
    return (
      <div className="App container-fluid">
        <h1>Pose Classifier</h1>
        <Header />
        
        <div className="row">
          <div className="col-sm">
            <VideoPlayer frameChanged={this.frameChanged}  />
         </div>
          <div className="col-sm">
            <Pose keypoints={keypoints} width={200} height={200*480/640}/>
            <h5>Classifications (number examples)</h5>
            <p>Click a classification to add an example from the pose of the current video frame.</p>
            <Classifications 
              labels={labels} 
              classExampleCount={classExampleCount}
              getButtonClass={this.getButtonClass}
              addExample={this.addExample} 
              updateLabel={this.updateLabel}
              addLabel={this.addLabel}
            />
            <ul className="list-unstyled">
              <li>
                <br /><br/>
                <button className='btn btn-light' onClick={this.resetClassifier}>Reset classifier</button>
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

const Header = () => (
  <div className='row'>
    <div className='col-sm'>
      <p>Classify poses from a live webcam feed or an existing video, 
        using <a href='https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5'>PoseNet</a> 
        and the <a href='https://github.com/tensorflow/tfjs-models/tree/master/knn-classifier'>KNN Classifier.</a>
        To add an entry to classify from the current frame, click the button for the corresponsding classification.
        The classification model <strong>is automatically saved to the browser <a href='https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage'>local storage,</a>
          </strong> and when the page is 
        refreshed or loaded this saved model is loaded. </p>
        <p>It works with a single pose, <b>and is best when one person in visible in the picture.</b>
        </p>
    </div>
  </div>
)

export default App;
