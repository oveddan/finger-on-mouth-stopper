import { Component } from "react";
import { Activities, CameraDatasets, CameraActivities } from "../types";
import { connect } from 'react-redux';
import { Dispatch, Action } from "redux";
import * as actions from "../activityActions";
import { saveDatasets, loadDatasets} from "../classifierStorage";
import { State } from "../reducers";
import { getServerState, CamerasStatus } from "../serverApi";

type DataSyncerProps = {
  cameraDatasets: CameraDatasets,
  activities: CameraActivities,
  intializeDatasets: typeof actions.initializeDataset
};

class DataSyncer extends Component<DataSyncerProps> {
  async componentDidMount() {
    const serverStatus = await getServerState();

    const storageEntry = loadDatasets();

    if (!storageEntry) {
      this.props.intializeDatasets(serverStatus.cameras, this.props.cameraDatasets, this.props.activities);
    } else {
      const { activities, dataset } = storageEntry;
      this.props.intializeDatasets(serverStatus.cameras, dataset, activities);
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

const mapDispatchToProps = {
  intializeDatasets: actions.initializeDataset,
};

const mapStateToProps = ({activities: {cameraDatasets, activities}}: State) => ({
  cameraDatasets, activities});

export default connect(mapStateToProps, mapDispatchToProps)(DataSyncer);
