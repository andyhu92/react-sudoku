import React from 'react'
import { EASY, MEDIUM, HARD} from './const'

export default function SelectLevel({ onSelect }){
    return (
        <div className="levels">
            <button className="btn btn-easy" onClick={() => onSelect(EASY)}>Easy</button>
            <button className="btn btn-medium" onClick={() => onSelect(MEDIUM)}>Medium</button>
            <button className="btn btn-hard" onClick={() => onSelect(HARD)}>Hard</button>
        </div>
    )
}