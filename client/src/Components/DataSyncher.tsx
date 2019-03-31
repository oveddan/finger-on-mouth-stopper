import { Component } from "react";
import { Labels, CameraDatasets } from "../types";
import { connect } from 'react-redux';
import { Dispatch } from "redux";
import * as actions from "../actions";
import { saveDatasets, loadDatasets} from "../classifierStorage";
import { Action } from "../actions";
import { State } from "../reducers";

type DataSyncerProps = {
  cameraDatasets: CameraDatasets,
  activities: Labels,
  setDatasets: typeof actions.setDatasets
}

class DataSyncer extends Component<DataSyncerProps> {
  componentDidMount() {
    const storageEntry = loadDatasets();

    if (!storageEntry) {
      this.props.setDatasets(this.props.cameraDatasets, this.props.activities);
    } else {
      const { activities, dataset } = storageEntry;
      this.props.setDatasets(dataset, activities);
    }
  }

  componentDidUpdate(prevProps: DataSyncerProps) {
    const { cameraDatasets, activities } = this.props;
    if (prevProps.cameraDatasets !== cameraDatasets || prevProps.activities !== activities) {
      saveDatasets(cameraDatasets, activities);
    }
  }

  render(){
    return null;
  }
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setDatasets: (dataset: CameraDatasets, activities: Labels) => dispatch(actions.setDatasets(dataset, activities)),
})

const mapStateToProps = ({cameraDatasets, activities}: State) => ({
  cameraDatasets, activities});

export default connect(mapStateToProps, mapDispatchToProps)(DataSyncer);
