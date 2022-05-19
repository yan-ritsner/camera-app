import React, { useState, useRef } from "react";
import { Camera } from "./Camera";

import './App.css'

const App = () => {
  const camera = useRef(null);
  const [image, setImage] = useState(null);

  return (
    <div>
      <Camera ref={camera} />
      <button
        className="camera-button"
        onClick={() => setImage(camera.current.takePhoto())}>
        Take photo
      </button>
      <img src={image} alt='p' />
    </div>
  )
}

export default App
