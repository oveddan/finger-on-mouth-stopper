import React, { Component } from 'react';
import './App.css';
import * as posenet from "@tensorflow-models/posenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as tf from '@tensorflow/tfjs';
import { loadClassifierAndLabelsFromLocalStorage, saveClassifierAndLabelsInLocalStorage } from './classifierStorage';
import { Tensor2D } from '@tensorflow/tfjs';
import Pose from './Pose';
import VideoPlayer from './VideoPlayer';
import Classifications, { ClassExampleCount } from './Classifications';
import EditableClassifications from './EditableClassifications';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const defaultLabels = ['withFingerOnMouth', 'coding'];

const fingerOnMountClass = 0;


class App extends Component {
  endAddingExampleTimeout?: number;
  classifier: knnClassifier.KNNClassifier = knnClassifier.create();

  state: {
    posenetModel?: posenet.PoseNet,
    detectionModel?: cocoSsd.ObjectDetection,
    videoLoaded: boolean,
    classId: number,
    addingExample: number | null,
    classExampleCount: ClassExampleCount,
    videoPlaying: boolean,
    keypoints?: [number, number][],
    personDetections: [number, number, number, number][],
    makeSound: boolean,
    editingClassifications: boolean,
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
    editingClassifications: false,
    makeSound: false,
    personDetections: [],
    videoSource: {
      liveVideo: false,
    },
    labels: defaultLabels
  };

  async componentDidMount() {
    const posenetModel = await posenet.load();
    const detectionModel = await cocoSsd.load(); 

    this.loadClassifier();

    this.setState({
      posenetModel,
      detectionModel
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
    if (this.state.posenetModel && this.state.detectionModel) {
      const videoTensor = tf.browser.fromPixels(video);
      const personDetections = await estimatePersonBoxes(this.state.detectionModel, videoTensor);

      const normalizedDetections = normalizeBoxes(personDetections, videoTensor);

      const keypoints = await estimateAndNormalizeKeypoints(
        this.state.posenetModel,
        videoTensor,
      );

      videoTensor.dispose();

      this.setState({keypoints, personDetections: normalizedDetections});

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

  handleMakeSoundChanged = (e: React.ChangeEvent<HTMLInputElement>) => {

    this.setState({
      makeSound: e.target.checked 
    })
  }

  toggleEditClassifications = () => {
    this.setState({editingClassifications: !this.state.editingClassifications});
  }

  render() {
    const { classExampleCount, labels, keypoints, personDetections } = this.state;
    return (
      <div className="App container-fluid">
        <h1>Pose Classifier</h1>
        
        <div className="row">
          <div className="col-sm">
            <VideoPlayer frameChanged={this.frameChanged}  />
         </div>
          <div className="col-sm">
            <h5>Normalized Pose to Classify:</h5>
            <Pose keypoints={keypoints} boxes={personDetections} width={200} height={200*480/640}/>
            <h5>
              Classifications (number examples): 
              {!this.state.editingClassifications && (
                <a href="#" onClick={this.toggleEditClassifications}>edit</a>
              )}
            </h5>
            {this.state.editingClassifications && (
              <EditableClassifications
                labels={labels} 
                classExampleCount={classExampleCount}
                getButtonClass={this.getButtonClass}
                addExample={this.addExample} 
                addLabel={this.addLabel}
                updateLabel={this.updateLabel}
              />
            )}
            {!this.state.editingClassifications && (
              <Classifications 
                labels={labels} 
                classExampleCount={classExampleCount}
                getButtonClass={this.getButtonClass}
                addExample={this.addExample} 
              />

            )}
            {this.state.editingClassifications && (
              <a href="#" onClick={this.toggleEditClassifications}>done editing</a>
            )}
            <br /><br/>
            <button className='btn btn-light' onClick={this.resetClassifier}>Reset classifier</button>

            <br/><br/>
            <label>
              Make sound when hand is on mouth:
              <input
                name="makeSound"
                type="checkbox"
                checked={this.state.makeSound}
                onChange={this.handleMakeSoundChanged} />
            </label>
            {this.state.makeSound && this.state.classId === fingerOnMountClass && (
              <audio src={process.env.PUBLIC_URL + 'airhorn.mp3'} autoPlay loop/>
            )}
          </div>
        </div>
        <Header />
      </div>
    );
  }
}

const estimatePersonBoxes = async (
  detectionModel: cocoSsd.ObjectDetection,
  videoTensor: tf.Tensor3D,
) => {
  const detections = await detectionModel.detect(videoTensor);
  
  return detections.filter(detection => detection.class === "person")
  .map(({bbox})=> bbox);
}

const normalizeBoxes = (boxes: [number, number, number, number][], videoTensor: tf.Tensor3D) => {
  const [height, width] = videoTensor.shape;

  return boxes.map(([x, y, w, h]) => [x / width, y / height, w / width, h / height]);
}

const estimateAndNormalizeKeypoints = async (
  posenetModel: posenet.PoseNet,
  video: tf.Tensor3D): Promise<number[][] | undefined> => {
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
  return poses[0].keypoints.map(({position: { x, y }})=> (
    [x / width, y / height] 
  ));
}

const Header = () => (
  <div className='row'>
    <div className='col-sm'>
      <p>Classify poses from a live webcam feed or an existing video, 
        using <a href='https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5'>PoseNet </a> 
        and the <a href='https://github.com/tensorflow/tfjs-models/tree/master/knn-classifier'>KNN Classifier. </a>
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
