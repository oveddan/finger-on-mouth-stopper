import React, {Component, ChangeEvent} from 'react'
import { CameraStatus } from '../../serverApi';
import StreamVideo from './StreamVideo';
import ExistingVideo from './ExistingVideo';
import WebcamVideo from './WebcamVideo';

const WEBCAM = 'Webcam';
const STREAM = 'Stream';
const EXISTING_VIDEO = 'ExistingVideo'

type State = {
  cameraSource: 'Webcam' | 'Stream' | 'ExistingVideo',
  videoUrl: string,
};

type Props = {
  frameChanged: (video: HTMLVideoElement | HTMLImageElement) => void,
  camera: CameraStatus,
  cameraId: number,
};


export default class VideoPlayer extends Component<Props, State> {
  state: State = {
    cameraSource: EXISTING_VIDEO,
    videoUrl: process.env.PUBLIC_URL + '/captureDay2.mp4'
  }

  handleWebcamClicked = async () => {
    this.setState({
      cameraSource: WEBCAM
    });
  }

  handleVideoClicked = () => {
    this.setState({
      cameraSource: EXISTING_VIDEO
    })
  }

  handleStreamClicked = () => {
    this.setState({cameraSource: STREAM});
  }

  handleUrlChanged = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      videoUrl: e.target.value
    });
  }

  render() {
    return (
      <div>
        <div className="input-group mb-3">
          <div className="input-group-prepend" id="button-addon3">
            <button key={1} className={`btn ${buttonClass(this.state.cameraSource === WEBCAM)}`} type="button" onClick={this.handleWebcamClicked}>Webcam</button>
            <button key={2} className={`btn ${buttonClass(this.state.cameraSource === STREAM)}`} type="button" onClick={this.handleStreamClicked}>Stream</button>
            <button key={3} className={`btn ${buttonClass(this.state.cameraSource === EXISTING_VIDEO)}`} type="button" onClick={this.handleVideoClicked}>Existing Video</button>
          </div>
          <input type="text"
            className="form-control"
            placeholder=""
            aria-describedby="button-addon3"
            disabled={this.state.cameraSource === WEBCAM}
            value={this.state.videoUrl}
            onChange={this.handleUrlChanged}
           />
        </div>
        {this.state.cameraSource === EXISTING_VIDEO && (
          <ExistingVideo url={this.state.videoUrl} frameChanged={this.props.frameChanged} />
        )}
        {this.state.cameraSource === STREAM && (
          <StreamVideo
            cameraId={this.props.cameraId}
            camera={this.props.camera}
            frameChanged={this.props.frameChanged}
          />
        )}
        {this.state.cameraSource === WEBCAM && (
          <WebcamVideo frameChanged={this.props.frameChanged}/>
        )}
      </div>
    )
  }
}

const buttonClass = (isActive: boolean) => isActive ? "btn-outline-primary" : "btn-outline-secondary"


