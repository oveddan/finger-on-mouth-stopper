import { Component } from "react";
import { Labels, CameraDatasets } from "../types";
import { connect } from 'react-redux';
import { Dispatch } from "redux";
import * as actions from "../actions";
import { saveDatasets, loadDatasets} from "../classifierStorage";
import { Action } from "../actions";
import { State } from "../reducers";
import { getServerState, CamerasStatus } from "../serverApi";

type DataSyncerProps = {
  cameraDatasets: CameraDatasets,
  activities: Labels,
  setDatasets: typeof actions.initializeDataset
};

class DataSyncer extends Component<DataSyncerProps> {
  async componentDidMount() {
    const serverStatus = await getServerState();

    const storageEntry = loadDatasets();

    if (!storageEntry) {
      this.props.setDatasets(serverStatus.cameras, this.props.cameraDatasets, this.props.activities);
    } else {
      const { activities, dataset } = storageEntry;
      this.props.setDatasets(serverStatus.cameras, dataset, activities);
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
  setDatasets: (cameras: CamerasStatus, dataset: CameraDatasets, activities: Labels) => dispatch(actions.initializeDataset(cameras, dataset, activities)),
})

const mapStateToProps = ({cameraDatasets, activities}: State) => ({
  cameraDatasets, activities});

export default connect(mapStateToProps, mapDispatchToProps)(DataSyncer);
