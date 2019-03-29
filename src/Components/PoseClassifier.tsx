import React, { Component } from 'react';
import * as posenet from "@tensorflow-models/posenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as tf from '@tensorflow/tfjs';
import { loadClassifierLabelsFromLocalStorage, saveClassifierAndLabelsInLocalStorage } from '../classifierStorage';
import { Tensor2D } from '@tensorflow/tfjs';
import Pose from './Pose';
import VideoPlayer from './VideoPlayer';
import Classifications from './Classifications';
import EditableClassifications from './EditableClassifications';
import { chunk, deleteExample, addKeypointsToDataset, setClassifierExamples, updateClassExamples, toExample } from '../util';
import { DatasetObject, Keypoint, Keypoints } from '../types';

class PoseClassifier extends Component {
  endAddingExampleTimeout?: number;
  classifier: knnClassifier.KNNClassifier = knnClassifier.create();

  state: {
    posenetModel?: posenet.PoseNet,
    dataset: DatasetObject,
    videoLoaded: boolean,
    classId: number,
    addingExample: number | null,
    videoPlaying: boolean,
    keypoints?: [number, number][],
    personDetections: [number, number, number, number][],
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
    videoPlaying: false,
    editingClassifications: false,
    personDetections: [],
    dataset: [],
    videoSource: {
      liveVideo: false,
    },
    labels: [] 
  };

  async componentDidMount() {
    this.loadData();

    const posenetModel = await posenet.load(1.00);

    this.setState({
      posenetModel
    })
  }

  loadData() {
    const { labels, dataset } = loadClassifierLabelsFromLocalStorage();

    if (dataset)
      setClassifierExamples(this.classifier, dataset);
    
    this.setState({
      labels,
      dataset
     });
  }

  saveData = async () => {
    await saveClassifierAndLabelsInLocalStorage(this.state.dataset, this.state.labels);
  }

  addExample = (classId: number) => {
    if (this.endAddingExampleTimeout) {
      window.clearTimeout(this.endAddingExampleTimeout);
    }

    this.setState({
      addingExample: classId
    });

    const { keypoints } = this.state;

    if (keypoints) {
      this.setState({
        dataset: addKeypointsToDataset(keypoints, this.state.dataset, classId)
      }, () => {
        updateClassExamples(this.classifier, this.state.dataset, classId);

        this.saveData();
      });
    }

    this.endAddingExampleTimeout = window.setTimeout(() => {
      this.setState({
        addingExample: null,
      });
    }, 200);
  }

  deleteExample = (classId: number, example: number): void => {
    this.setState({
      dataset: deleteExample(this.state.dataset, classId, example)
    }, () => {
      updateClassExamples(this.classifier, this.state.dataset, classId);
    });

    requestAnimationFrame(() => {
      this.setState({
        classExampleCount: this.classifier.getClassExampleCount()
      });
    })
  }

  updateClassification = async() => {
    const classId = await this.classify();

    this.setState({
      classId
    });
  }

  estimateKeypoints = async (video: HTMLVideoElement) => {
    if (this.state.posenetModel) {
      let videoTensor: tf.Tensor3D;
      try {
        videoTensor = tf.browser.fromPixels(video);
      } catch(e) {
        console.error('could not load video');
        return;
      }

      const keypoints = await estimateAndNormalizeKeypoints(this.state.posenetModel, videoTensor);

      this.setState({keypoints});

      this.updateClassification();
    }
  }


  updateLabel = async (classId: number, label: string | undefined) => {
    if (!label) return;
    const newLabels = this.state.labels.splice(0);

    newLabels[classId] = label;

    this.setState({
      labels: newLabels
    }, this.saveData);
  }

  addLabel = async (label: string) => {
    const newLabels = this.state.labels.splice(0);

    newLabels.push(label);

    this.setState({
      labels: newLabels
    }, this.saveData);
  }

  classify = async() => {
    if (Object.keys(this.state.dataset).length === 0) return;

    const { keypoints } = this.state;

    if (!keypoints) return;

    const keypointsTensor = toExample(keypoints);

    const prediction = await this.classifier.predictClass(keypointsTensor);

    keypointsTensor.dispose();

    return prediction.classIndex;
  }

  resetDataset = async () => {
    this.setState({
      dataset: {},
      labels: []
    }, () => {
      this.classifier.clearAllClasses();
      this.saveData();
    });
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

  getClassificationKeypoints = async (classId: number): Promise<[number, number][][]> => {
    const tensor = await this.classifier.getClassifierDataset()[classId];

    const data = Array.from(await tensor.data()) as number[];

    const chunkedToPose = chunk(data, 34).map(poseKeypoints => chunk(poseKeypoints, 2) as [number, number][]);

    return chunkedToPose;
  }

  render() {
    const { dataset, labels, keypoints, personDetections } = this.state;
    return (
      <div>
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
              <div>
                <EditableClassifications
                  labels={labels} 
                  dataset={dataset}
                  getButtonClass={this.getButtonClass}
                  addExample={this.addExample} 
                  addLabel={this.addLabel}
                  updateLabel={this.updateLabel}
                  getClassificationKeypoints={this.getClassificationKeypoints}
                  deleteExample={this.deleteExample}
                />
              </div>
            )}
            {!this.state.editingClassifications && (
              <Classifications 
                labels={labels} 
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
        <Header />
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

export default PoseClassifier;
