import React, { Component } from 'react'

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

type WebcamVideoProps = {
  frameChanged: (video: HTMLVideoElement) => void
}

export default class WebcamVideo extends Component<WebcamVideoProps> {
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
