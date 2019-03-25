import React, { useState } from 'react'

type State = {
  editingClassId?: number,
  editingLabel?: string,
  newLabel?: string
}

type Props = {
  labels: string[],
  getButtonClass: (id: number) => string,
  addExample: (id: number) => void,
  updateLabel: (id: number, label: string | undefined) => void,
  addLabel: (label: string) => void,
  classExampleCount: ClassExampleCount
}

export type ClassExampleCount = {[classId: number]: number};

const ENTER = 'Enter';
const ESCAPE = 'Escape';

const Classifications = ({labels, getButtonClass, addExample, classExampleCount, updateLabel, addLabel}: Props) => {
  const [{editingClassId, editingLabel, newLabel}, setState] = useState<State>({
  });

  const saveLabel = async () => {
    if (typeof editingClassId !== 'undefined') {
      await updateLabel(editingClassId, editingLabel); 
      setState({});
    } else if (newLabel) {
      await addLabel(newLabel);
      setState({});
    }
  }

  const keyPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ENTER) {
      saveLabel();
    }
  } 

  return (
    <div>
      {labels.map((name, id) => {
        if(editingClassId === id)
          return (
            <input type='text' 
              value={editingLabel} 
              onChange={e => setState({editingClassId, editingLabel: e.target.value})} 
              onBlur={saveLabel} 
              onKeyPress={keyPressed}
            />
          )
        else
          return (
            <div key={id} className="btn-group" role="group">
              <button type="button" className={`btn btn-light`} onClick={() => setState({editingClassId: id, editingLabel: name})}>
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
      <br/>
      {!newLabel && (
        <button type="button" className="btn btn-light" onClick={() => setState({newLabel: 'label'})}>
          <i className="fas fa-plus"></i>
        </button>
      )}
      {newLabel && (
        <input type='text' 
          value={newLabel} 
          onChange={e => setState({newLabel: e.target.value})} 
          onKeyPress={keyPressed}
        />
      )}
    </div>
  )
}

export default Classifications