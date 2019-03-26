import React, {useState, Component, ChangeEvent} from 'react'

type State = {
  useCamera: boolean,
  videoUrl: string,
  stream?: MediaStream
};

type Props = {
  frameChanged: (video: HTMLVideoElement) => void
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
  videoRef: React.RefObject<HTMLVideoElement> = React.createRef<HTMLVideoElement>();

  state: State = {
    useCamera: false,
    videoUrl: process.env.PUBLIC_URL + 'captureDay1.mp4'
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

  handleWebcamClicked = async () => {
    const video = this.videoRef.current;

    if (!video) return;

    video.pause();

    this.setState({
      useCamera: true
    });

    const stream = await setupCamera();

    this.setState({
      stream
    });

    video.srcObject = stream;

    video.play();
  }

  handleVideoClicked = () => {
    if (this.state.stream) {
      this.state.stream.getTracks().forEach(track => track.stop());
    }

    if (this.videoRef.current) {
      this.videoRef.current.srcObject = null;
      this.videoRef.current.play();
    }

    this.setState({
      useCamera: false
    })

  }

  handleUrlChanged = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      videoUrl: e.target.value
    });

    if (this.videoRef.current)
      this.videoRef.current.load();
  }

  render() {
    return (
      <div>
        <div className="input-group mb-3">
          <div className="input-group-prepend" id="button-addon3">
            <button className={`btn ${buttonClass(this.state.useCamera)}`} type="button" onClick={this.handleWebcamClicked}>Webcam</button>
            <button className={`btn ${buttonClass(!this.state.useCamera)}`} type="button" onClick={this.handleVideoClicked}>Existing Video</button>
          </div>
          <input type="text"
            className="form-control"
            placeholder=""
            aria-describedby="button-addon3"
            disabled={this.state.useCamera}
            value={this.state.videoUrl}
            onChange={this.handleUrlChanged}
           />
        </div>
        <video controls={!this.state.useCamera}
          ref={this.videoRef}
          onLoadedMetadata={this.videoLoaded}
          onTimeUpdate={this.frameChanged}
        >
          <source src={this.state.videoUrl} type="video/mp4" />
        </video>
      </div>
    )
  }
}

const buttonClass = (isActive: boolean) => isActive ? "btn-outline-primary" : "btn-outline-secondary"
