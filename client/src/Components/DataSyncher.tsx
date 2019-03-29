import { Component } from "react";
import { DatasetObject, State } from "../types";
import { connect } from 'react-redux';
import { Dispatch } from "redux";
import * as actions from "../actions";
import { saveClassifierAndLabelsInLocalStorage, loadClassifierLabelsFromLocalStorage } from "../classifierStorage";
import { data } from "@tensorflow/tfjs";
import { KNNClassifier } from "@tensorflow-models/knn-classifier";
import { setClassifierExamples } from "../util";

type DataSyncerProps = {
  dataset: DatasetObject,
  labels: string[],
  setDataset: typeof actions.setDataset,
  classifier: KNNClassifier
}

class DataSyncer extends Component<DataSyncerProps> {
  componentDidMount() {
    const { labels, dataset } = loadClassifierLabelsFromLocalStorage();

    this.props.setDataset(dataset, labels);

    setClassifierExamples(this.props.classifier, dataset);
  }

  componentDidUpdate(prevProps: DataSyncerProps) {
    const { dataset, labels } = this.props;
    if (prevProps.dataset !== dataset || prevProps.labels !== labels) {
      saveClassifierAndLabelsInLocalStorage(dataset, labels);
    }
  }

  render(){
    return null;
  }
}

const mapDispatchToProps = (dispatch: Dispatch<actions.ActionTypes>) => ({
  setDataset: (dataset: DatasetObject, labels: string[]) => dispatch(actions.setDataset(dataset, labels)),
  clearDataset: () => dispatch(actions.clearDataset())
})

const mapStateToProps = ({dataset, labels}: State) => ({
  dataset, labels
});

export default connect(mapStateToProps, mapDispatchToProps)(DataSyncer);
