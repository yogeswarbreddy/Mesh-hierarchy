import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import './MovableWindow.css';

const MovableWindow = () => {
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef}>
      <div ref={nodeRef} className="movable-window">
        <div className="window-header">Movable Window</div>
        <div className="window-content">
        </div>
      </div>
    </Draggable>
  );
};

export default MovableWindow;
