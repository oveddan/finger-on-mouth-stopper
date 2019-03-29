import { Component } from "react";
import { DatasetObject, Keypoints } from "../types";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import { setClassifierExamples, toExample } from "../util";

type Props = {
  dataset: DatasetObject,
  keypoints?: Keypoints
}

class Classifier extends Component<Props> {
  classifier: knnClassifier.KNNClassifier = knnClassifier.create();
  async componentDidMount() {

    if (this.props.keypoints) {
      await this.classify();
    }
  }

  componentDidUpdate(nextProps: Props) {
    if (nextProps.dataset !== this.props.dataset) {
      setClassifierExamples(this.classifier, nextProps.dataset);
    }

    this.classify();
  }

  classify = async() => {
    if (Object.keys(this.props.dataset).length === 0) return;

    const { keypoints } = this.props;

    if (!keypoints) return;

    const keypointsTensor = toExample(keypoints);

    const prediction = await this.classifier.predictClass(keypointsTensor);

    keypointsTensor.dispose();

    return prediction.classIndex;
  }

  render() {
    return null;
  }
}
