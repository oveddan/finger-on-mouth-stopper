import { Component } from "react";
import { DatasetObject, Labels } from "../types";
import { connect } from 'react-redux';
import { Dispatch } from "redux";
import * as actions from "../actions";
import { saveClassifierAndLabelsInLocalStorage, loadClassifierLabelsFromLocalStorage } from "../classifierStorage";
import { KNNClassifier } from "@tensorflow-models/knn-classifier";
import { setClassifierExamples } from "../util";
import { Action } from "../actions";
import { State } from "../reducers";

type DataSyncerProps = {
  dataset: DatasetObject,
  labels: Labels,
  setDataset: typeof actions.setDataset,
  clearDataset: typeof actions.clearDataset,
  classifier: KNNClassifier
}

class DataSyncer extends Component<DataSyncerProps> {
  componentDidMount() {
    const { activities, dataset } = loadClassifierLabelsFromLocalStorage();
    if (activities && dataset) {

      this.props.setDataset(dataset, activities);

      setClassifierExamples(this.props.classifier, dataset);
    }
  }

  componentDidUpdate(prevProps: DataSyncerProps) {
    const { dataset, labels} = this.props;
    if (prevProps.dataset !== dataset || prevProps.labels !== labels) {
      saveClassifierAndLabelsInLocalStorage(dataset, labels);
    }
  }

  render(){
    return null;
  }
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setDataset: (dataset: DatasetObject, activities: Labels) => dispatch(actions.setDataset(dataset, activities)),
  clearDataset: () => dispatch(actions.clearDataset())
})

const mapStateToProps = ({dataset, labels}: State) => ({
  dataset, labels
});

export default connect(mapStateToProps, mapDispatchToProps)(DataSyncer);
