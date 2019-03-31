import React, { Component } from 'react';

type ExistinVideoProps = {
  url: string,
  frameChanged: (video: HTMLVideoElement) => void
};

export default class ExistingVideo extends Component<ExistinVideoProps> {
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
