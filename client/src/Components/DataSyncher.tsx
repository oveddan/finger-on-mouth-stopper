import { Component } from "react";
import { DatasetObject, State, Activities } from "../types";
import { connect } from 'react-redux';
import { Dispatch } from "redux";
import * as actions from "../actions";
import { saveClassifierAndLabelsInLocalStorage, loadClassifierLabelsFromLocalStorage } from "../classifierStorage";
import { KNNClassifier } from "@tensorflow-models/knn-classifier";
import { setClassifierExamples } from "../util";

type DataSyncerProps = {
  dataset: DatasetObject,
  activities: Activities,
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
    const { dataset, activities } = this.props;
    if (prevProps.dataset !== dataset || prevProps.activities !== activities) {
      saveClassifierAndLabelsInLocalStorage(dataset, activities);
    }
  }

  render(){
    return null;
  }
}

const mapDispatchToProps = (dispatch: Dispatch<actions.ActionTypes>) => ({
  setDataset: (dataset: DatasetObject, activities: Activities) => dispatch(actions.setDataset(dataset, activities)),
  clearDataset: () => dispatch(actions.clearDataset())
})

const mapStateToProps = ({dataset, activities}: State) => ({
  dataset, activities
});

export default connect(mapStateToProps, mapDispatchToProps)(DataSyncer);
