import React from 'react'
import { DatasetObject, Activities } from '../types';

type Props = {
  activities: Activities,
  getButtonClass: (id: number) => string,
  addExample: (id: number) => void,
  dataset: DatasetObject
}

export type ClassExampleCount = {[classId: number]: number};

const Classifications = ({activities, getButtonClass, addExample, dataset}: Props) => {
  return (
    <div>
      {Object.entries(activities).map((name, id) => (
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
