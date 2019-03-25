import React, { useState } from 'react'

type Props = {
  labels: string[],
  getButtonClass: (id: number) => string,
  addExample: (id: number) => void,
  classExampleCount: ClassExampleCount
}

export type ClassExampleCount = {[classId: number]: number};

const Classifications = ({labels, getButtonClass, addExample, classExampleCount}: Props) => {
  return (
    <div>
      {labels.map((name, id) => (
        <button type="button" key={id}
          className={`btn ${getButtonClass(id)}`}
          onClick={() => addExample(id)}>
          {`${name} (${classExampleCount[id] || 0})`}
        </button>
     ))}
    </div>
  )
}

export default Classifications