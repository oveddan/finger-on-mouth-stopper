import React, {Component, ChangeEvent} from 'react'
import { CameraStatus } from '../serverApi';
import StreamVideo from './StreamVideo';

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


/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  return await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user'
    },
  });
}

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

type ExistinVideoProps = {
  url: string,
  frameChanged: (video: HTMLVideoElement) => void
};

class ExistingVideo extends Component<ExistinVideoProps> {
  videoRef: React.RefObject<HTMLVideoElement> = React.createRef<HTMLVideoElement>();

  componentWillUnmount() {
    if (this.videoRef.current) {
      this.videoRef.current.pause();
    }
  }

  componentDidUpdate(prevProps: ExistinVideoProps){
    if (prevProps.url !== this.props.url) {
      if (this.videoRef.current)
        this.videoRef.current.load();
    }
  }

  videoLoaded = () => {
    const video = this.videoRef.current;
    if (video) {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
    }
  }

  frameChanged = () => {
    const video = this.videoRef.current;

    if (!video) return;

    this.props.frameChanged(video);
  }

  render() {
    return (
      <video controls
        ref={this.videoRef}
        onLoadedMetadata={this.videoLoaded}
        onTimeUpdate={this.frameChanged}
      >
        <source src={this.props.url} type="video/mp4" />
      </video>
    );
  }
}

type WebcamVideoProps = {
  frameChanged: (video: HTMLVideoElement) => void
}

class WebcamVideo extends Component<WebcamVideoProps> {
  videoRef: React.RefObject<HTMLVideoElement> = React.createRef<HTMLVideoElement>();
  stream?: MediaStream

  componentWillUnmount() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  async componentDidMount() {
    this.stream = await setupCamera();

    const video = this.videoRef.current;

    if (video) {
      video.srcObject = this.stream;

      video.play();
    }
  }

  frameChanged = () => {
    const video = this.videoRef.current;

    if (!video) return;

    this.props.frameChanged(video);
  }

  videoLoaded = () => {
    const video = this.videoRef.current;
    if (video) {
      video.width = video.videoWidth;
      video.height = video.videoHeight;
    }
  }

  render() {
    return (
      <video
        ref={this.videoRef}
        onLoadedMetadata={this.videoLoaded}
        onTimeUpdate={this.frameChanged}
      >
      </video>
    );
  }
}
