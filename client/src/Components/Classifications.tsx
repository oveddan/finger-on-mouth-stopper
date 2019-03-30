import React from 'react'
import { DatasetObject, Labels } from '../types';

type Props = {
  activities: Labels,
  getButtonClass: (id: number) => string,
  addExample: (id: number) => void,
  dataset: DatasetObject
}

export type ClassExampleCount = {[classId: number]: number};

const Classifications = ({activities, getButtonClass, addExample, dataset}: Props) => {
  return (
    <div>
      {Object.keys(activities).map(id => (
        <button type="button" key={+id}
          className={`btn ${getButtonClass(+id)}`}
          onClick={() => addExample(+id)}
        >
          {`${activities[+id]} (${dataset[+id] ? dataset[+id].length : 0})`}
        </button>
     ))}
    </div>
  )
}

export default Classifications
