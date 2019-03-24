import React, { Component } from 'react';
import './App.css';
import * as posenet from "@tensorflow-models/posenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as tf from '@tensorflow/tfjs';
import { loadClassifierFromLocalStorage, saveClassifierInLocalStorage } from './classifierStorage';

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
  videoRef: React.RefObject<HTMLVideoElement> = React.createRef<HTMLVideoElement>();
  normalizationVector?: tf.Tensor1D;
  endAddingExampleTimeout?: number;
  classifier: knnClassifier.KNNClassifier = knnClassifier.create();

  state: {
    posenetModel?: posenet.PoseNet,
    videoLoaded: boolean,
    classId: number,
    autoClassify: boolean,
    addingExample: number | null,
    classExampleCount: ClassExampleCount,
    videoPlaying: boolean
  } = {
    videoLoaded: false,
    classId: -1,
    autoClassify: true,
    addingExample: null,
    classExampleCount: {},
    videoPlaying: false
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

  videoLoaded = () => {
    const video = this.videoRef.current;
    if (video) {
      video.width = video.videoWidth;
      video.height = video.videoHeight;

      this.normalizationVector = tf.tensor1d([1/video.width, 1/video.height]);

      this.setState({
        videoLoaded: true,
      });

      this.classify();
    }
  }

  estimateKeypoints = async (): Promise<tf.Tensor2D | null> => {
    if (this.state.posenetModel && this.videoRef.current && this.normalizationVector) {
      const poses = await this.state.posenetModel.estimateMultiplePoses(this.videoRef.current);
      if (poses.length === 0) {
        return null;
      }

      return tf.tidy(() => {
        const keypoints = tf.tensor2d(poses[0].keypoints.map(p => ([p.position.x, p.position.y])));

        return keypoints.mul(this.normalizationVector as tf.Tensor1D) as tf.Tensor2D;
      })
    } else {
      return null;
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

    const keypoints = await this.estimateKeypoints();

    if (keypoints) {
      this.classifier.addExample(keypoints, classId);
      keypoints.dispose();

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

  classify = async() => {
    const keypoints = await this.estimateKeypoints();
    if (keypoints) {
       const prediction = await this.classifier.predictClass(keypoints);
       this.setState({
         classId: prediction.classIndex
       });
       keypoints.dispose();
    }
  }

  resetClassifier = () => {
    this.classifier.clearAllClasses();
    this.saveClassifier();
    this.setState({
      classExampleCount: this.classifier.getClassExampleCount()
    })
  }


  handleAutoclassifyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      autoClassify: e.target.checked
    });
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

  frameChanged = () => {
    if (this.state.autoClassify) {
      this.classify();
    }
  }


  render() {
    const { classExampleCount } = this.state;
    return (
      <div className="App container-fluid">
        <h1>Pose Classifier</h1>
        <div className="row">
          <div className="col-sm">
            <h2>Video</h2>
            <video controls ref={this.videoRef} onLoadedMetadata={this.videoLoaded} onTimeUpdate={this.frameChanged}>
              <source src={process.env.PUBLIC_URL + 'mecoding.mp4'} type="video/mp4" />
            </video>
          </div>
          <div className="col-sm">
            <h3>Classifications (number examples)</h3>
            <h5>Click a classification to add an example from the pose of the current frame</h5>
              {this.state.videoLoaded && (
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
                <label>
                   Auto Classifiy:
                  <input
                    name="autoClassify"
                    type="checkbox"
                    checked={this.state.autoClassify}
                    onChange={this.handleAutoclassifyChange} />
                </label>
              </li>
              <li>
                <button disabled={this.state.autoClassify} onClick={this.classify}>Classify</button>
              </li>
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

export default App;
