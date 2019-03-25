import React, { useState } from 'react'

type State = {
  editingClassId?: number,
  editingLabel?: string,
}

type Props = {
  labels: string[],
  getButtonClass: (id: number) => string,
  addExample: (id: number) => void,
  updateLabel: (id: number, label: string | undefined) => void,
  classExampleCount: ClassExampleCount
}

export type ClassExampleCount = {[classId: number]: number};

const Classifications = ({labels, getButtonClass, addExample, classExampleCount, updateLabel}: Props) => {
  const [{editingClassId, editingLabel}, setState] = useState<State>({
  });

  return (
    <div>
      {labels.map((name, id) => {
        if(editingClassId === id)
          return (
            <input key={id} type='text' 
              value={editingLabel} 
              onChange={e => setState({editingClassId, editingLabel: e.target.value})} 
              onBlur={async () => { await updateLabel(id, editingLabel); setState({})}} 
            />
          )

        else
          return (
            <div key={id} className="btn-group" role="group">
              <button type="button" className={`btn ${getButtonClass(id)}`} onClick={() => setState({editingClassId: id, editingLabel: name})}>
                <i className="far fa-edit"></i>
              </button>
              <button type="button" key={id}
                className={`btn ${getButtonClass(id)}`}
                onClick={() => addExample(id)} >
                {`${name} (${classExampleCount[id] || 0})`}
              </button>
            </div>
         )
      })}
    </div>
  )
}

export default Classifications