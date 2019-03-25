import React from 'react'
import * as posenet from "@tensorflow-models/posenet"
import { connectedPartIndices } from '@tensorflow-models/posenet/dist/keypoints';

type PoseProps = {
  keypoints?: [number, number][],
  width: number,
  height: number
}

type AdjacentKeypoints = [[number, number], [number, number]][];

function getAdjacentKeyPoints(
  keypoints: [number, number][]): AdjacentKeypoints {
return connectedPartIndices.reduce(
    (result: AdjacentKeypoints, [leftJoint, rightJoint]): AdjacentKeypoints => {
      result.push([keypoints[leftJoint], keypoints[rightJoint]]);

      return result;
    }, []);
}

const lineStyle = {
  stroke:'rgb(255,0,0)',
  strokeWidth:2
}

const circleStyle = {
  fill:'rgb(255,0,0)',
}
const rectStyle = {
  stroke:'rgb(0,0,0)',
  strokeWidth:2,
  fill: 'none'
}

const faceKeypoints = [0, 1, 2, 3];

const Pose = ({keypoints, width, height}: PoseProps) => {
  let adjacentKeypoints: AdjacentKeypoints = [];

  if (keypoints)
     adjacentKeypoints = getAdjacentKeyPoints(keypoints);

  return (
    <svg width={width} height={height} style={{marginBottom: '0.5rem'}}>
      <rect width={width} height={height} style={rectStyle}/>
      {(keypoints && faceKeypoints.map(keypointIndex => (
        <circle style={circleStyle} r={2} cx={keypoints[keypointIndex][0] * width} cy={keypoints[keypointIndex][1] * height} />
      )))}
      {(adjacentKeypoints.map(([[x1, y1], [x2, y2]], index)=> (
        <line style={lineStyle} key={index} x1={x1 * width} y1={y1 * height} x2={x2 * width} y2={y2 * height}  />
      )))}
    </svg>
  )
};

export default Pose;
