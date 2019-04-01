import React, { Component, createRef } from "react";
import { CameraStatus, CamerasStatus, setRecording } from "../../serverApi";
import { connect } from 'react-redux';
import * as actions from "../../actions/activityActions";
import cx from 'classnames';
import { bindActionCreators, Dispatch, Action } from "redux";
import { RootAction } from "../../types";

const UPDATE_DURATION = 250;

const CAMERA_HOST = 'http://localhost:5000'

type StreamVideoProps = {
  frameChanged: (video: HTMLVideoElement | HTMLImageElement) => void,
  camera: CameraStatus,
  cameraId: number,
  updateCamerasStatus: (camerasStatus: CamerasStatus) => void
}

class StreamVideo extends Component<StreamVideoProps> {
  imageRef = createRef<HTMLImageElement>();
  updateInterval?: NodeJS.Timeout;

  imageLoaded = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setTimeout(() => {
      const image = this.imageRef.current;
      if (image) {
        image.width = image.clientWidth;
        image.height = image.clientHeight;
      }

      this.startUpdating();
    }, 100);
  }

  startUpdating = () => {
    this.updateInterval = setInterval(() => {
      if(this.imageRef.current) {
        this.props.frameChanged(this.imageRef.current);
      }
    }, UPDATE_DURATION);
  }

  componentWillUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  toggleRecording = async () => {
    console.log('toggling recording');
    const serverStatus = await setRecording(this.props.cameraId, !this.isRecording());

    console.log('result status', serverStatus);

    this.props.updateCamerasStatus(serverStatus.cameras);
  }

  isRecording = () => this.props.camera.recordingPath !== null

  buttonText = () => this.isRecording() ? "Recording..." : "Record"

  render() {
    const buttonClass = cx(['btn', {['btn-primary']:this.isRecording()}]);

    return (
      <div>
        <img ref={this.imageRef} src={`${CAMERA_HOST}/${this.props.camera.name}.mjpeg`} onLoad={this.imageLoaded} crossOrigin="anonymous"/>
        <button className={buttonClass} onClick={() => this.toggleRecording()}>{this.buttonText()}</button>
      </div>
    )
  }
}

const mapStateToProps = () => ({})

const mapDispatchToProps = {
  updateCamerasStatus: actions.updateCamerasStatus
};

export default connect(mapStateToProps , mapDispatchToProps)(StreamVideo)
