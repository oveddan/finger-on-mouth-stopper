import React, { useState } from 'react'
import { Dataset, DatasetObject } from './classifierStorage';
import { datasetFromIteratorFn } from '@tensorflow/tfjs-data/dist/dataset';

type Props = {
  labels: string[],
  getButtonClass: (id: number) => string,
  addExample: (id: number) => void,
  dataset: DatasetObject
}

export type ClassExampleCount = {[classId: number]: number};

const Classifications = ({labels, getButtonClass, addExample, dataset}: Props) => {
  return (
    <div>
      {labels.map((name, id) => (
        <button type="button" key={id}
          className={`btn ${getButtonClass(id)}`}
          onClick={() => addExample(id)}
        >
          {`${name} (${dataset[id] ? dataset[id].length : 0})`}
        </button>
     ))}
    </div>
  )
}

export default Classifications