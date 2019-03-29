import React, { Component, Dispatch } from 'react';
import * as posenet from "@tensorflow-models/posenet";
import * as tf from '@tensorflow/tfjs';
import { loadClassifierLabelsFromLocalStorage, saveClassifierAndLabelsInLocalStorage } from '../classifierStorage';
import { Tensor2D } from '@tensorflow/tfjs';
import Pose from './Pose';
import VideoPlayer from './VideoPlayer';
import Classifications from './Classifications';
import EditableClassifications from './EditableClassifications';
import { chunk, setClassifierExamples, updateClassExamples, toExample } from '../util';
import { DatasetObject, Keypoint, Keypoints, State } from '../types';
import { connect } from 'react-redux';
import * as actions from '../actions';
import DataSyncher from './DataSyncher';
import { create, KNNClassifier } from '@tensorflow-models/knn-classifier';

interface PoseClassifierProps {
  dataset: DatasetObject,
  labels: string[],
  keypoints?: Keypoints,
  addExample: (classId: number) => void,
  deleteExample: (classId: number, exampleId: number) => void,
  clearDataset: () => void,
  addLabel: (text: string) => void,
  updateLabel: (id: number, text: string) => void,
  keypointsEstimated: (keypoints: Keypoints) => void
};

class PoseClassifier extends Component<PoseClassifierProps> {
  endAddingExampleTimeout?: number;
  classifier: KNNClassifier = create();

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

    updateClassExamples(this.classifier, this.props.dataset, classId);

    this.endAddingExampleTimeout = window.setTimeout(() => {
      this.setState({
        addingExample: null,
      });
    }, 200);
  }

  deleteExample = (classId: number, example: number): void => {
    this.props.deleteExample(classId, example);

    updateClassExamples(this.classifier, this.props.dataset, classId);
  }

  updateClassification = async() => {
    const classId = await classify(this.classifier, this.props.dataset, this.props.keypoints);

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

      if (keypoints) {
        this.props.keypointsEstimated(keypoints);

        this.updateClassification();
      }
    }
  }

  resetDataset = async () => {
    this.props.clearDataset();
    this.classifier.clearAllClasses();
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
    const { dataset, labels, keypoints } = this.props;
    return (
      <div>
        <h1>Pose Classifier</h1>
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
                  labels={labels}
                  dataset={dataset}
                  getButtonClass={this.getButtonClass}
                  addLabel={this.props.addLabel}
                  updateLabel={this.props.updateLabel}
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
        <DataSyncher classifier={this.classifier} />
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

const classify = async(classifier: KNNClassifier, dataset: DatasetObject, keypoints?: Keypoints) => {
  if (Object.keys(dataset).length === 0) return;

  if (!keypoints) return;

  const keypointsTensor = toExample(keypoints);

  const prediction = await classifier.predictClass(keypointsTensor);

  keypointsTensor.dispose();

  return prediction.classIndex;
}



const mapStateToProps = ({dataset, labels, keypoints}: State) => ({
  dataset, labels, keypoints
});

const mapDispatchToProps = (dispatch: Dispatch<actions.ActionTypes>) => ({
  addExample: (classId: number) => dispatch(actions.addExample(classId)),
  deleteExample: (classId: number, exampleId: number) => dispatch(actions.deleteExample(classId, exampleId)),
  clearDataset: () => dispatch(actions.clearDataset()),
  addLabel: (text: string) => dispatch(actions.addLabel(text)),
  updateLabel: (id: number, text: string) => dispatch(actions.updateLabel(id, text)),
  keypointsEstimated: (keypoints: Keypoints) => dispatch(actions.keypointsEstimated(keypoints))
});


export default connect(mapStateToProps, mapDispatchToProps)(PoseClassifier);

