import React from 'react'
import * as posenet from "@tensorflow-models/posenet"
import { connectedPartIndices } from '@tensorflow-models/posenet/dist/keypoints';
import { mean } from '../util';

type PoseProps = {
  keypoints?: [number, number][],
  width: number,
  height: number,
  boxes: [number, number, number, number][]
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

const boxStyle = {
  stroke:'rgb(0,255,0)',
  strokeWidth:2,
  fill: 'none'
}

const faceKeypoints = [0, 1, 2, 3];

const POSITIVE_INFINITY = Infinity;
const NEGATIVE_INFINITY = -Infinity;

type BoundingBox = {maxX: number, maxY: number, minX: number, minY: number};

function getBoundingBox(keypoints: [number, number][]): BoundingBox {
  return keypoints.reduce(({maxX, maxY, minX, minY}, [x, y]) => {
    return {
      maxX: Math.max(maxX, x),
      maxY: Math.max(maxY, y),
      minX: Math.min(minX, x),
      minY: Math.min(minY, y)
    };
  }, {
    maxX: NEGATIVE_INFINITY,
    maxY: NEGATIVE_INFINITY,
    minX: POSITIVE_INFINITY,
    minY: POSITIVE_INFINITY
  });
}

type Tuple = [number, number];

const getScale = (boundingBox: BoundingBox, [width, height]: Tuple ): Tuple => {
  return [width/2/(boundingBox.maxX - boundingBox.minX), height/2/(boundingBox.maxY - boundingBox.minY)];
}


const getTranslateToCenter = (boundingBox: BoundingBox, [width, height]: Tuple): Tuple => {
  const [centerX, centerY]= [mean([boundingBox.maxX, boundingBox.minX]), mean([boundingBox.maxY, boundingBox.minY])];

  return [width/2 - centerX, height/2 - centerY];
}

const getTranslateToTopLeft = (boundingBox: BoundingBox, [width, height]: Tuple): Tuple => {
  return [-boundingBox.minX, -boundingBox.minY];
}

const Pose = ({keypoints, width, height, boxes}: PoseProps) => {
  let adjacentKeypoints: AdjacentKeypoints = [];

  if (keypoints)
     adjacentKeypoints = getAdjacentKeyPoints(keypoints);

  const scale = [width, height];;

  const scaleX = (x: number) => x * scale[0];
  const scaleY = (y: number) => y * scale[1]; 

  return (
    <svg width={width} height={height} style={{marginBottom: '0.5rem'}}>
      <rect width={width} height={height} style={rectStyle}/>
      {(boxes.map(([x, y, w, h], key)=> (
        <rect key={key} x={x * width} y={y * height} width={w * width} height={h * height} style={boxStyle} />
      )))}
      {(keypoints && faceKeypoints.map(keypointIndex => (
        <circle 
          key={keypointIndex} 
          style={circleStyle} 
          r={2} 
          cx={scaleX(keypoints[keypointIndex][0])} 
          cy={scaleY(keypoints[keypointIndex][1])} 
        />
      )))}
      {(adjacentKeypoints.map(([[x1, y1], [x2, y2]], index)=> (
        <line 
          style={lineStyle} key={index} 
          x1={scaleX(x1)} 
          y1={scaleY(y1)} 
          x2={scaleX(x2)} 
          y2={scaleY(y2)}
        />
      )))}
    </svg>
  )
};

export default Pose;
