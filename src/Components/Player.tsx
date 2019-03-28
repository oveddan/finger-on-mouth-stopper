import React from 'react'
import ReactPlayer from 'react-player'


type PlayerProps = {
  position: number,
  playing: boolean
}

export default class Player extends React.Component {
  videoRef: React.RefObject<HTMLVideoElement> = React.createRef<HTMLVideoElement>();

  getVideo() {
    return this.videoRef;
  }

  render() {
    return (
      <video controls ref={this.videoRef}>
        <source src={process.env.PUBLIC_URL + 'sonic.mp4'} type="video/mp4" />
      </video>
    )
  }
}
