import React, { useState, useRef, useCallback } from "react"

import { Camera } from "./Camera"
import { CAMERA_ASPECT_RATIO } from "./Camera/Camera.constants"

import './App.css'


const App = () => {
  const [numberOfCameras, setNumberOfCameras] = useState(0)
  const [image, setImage] = useState(null)
  const [showImage, setShowImage] = useState(false)
  const camera = useRef(null)

  const backgroundImage = image ? `url(${image})` : ''
  const toggleImage  = useCallback(()=>{
    setShowImage((value) => !value)
  }, [])
  const takePhoto = useCallback(()=> {
    if (camera.current) {
      const photo = camera.current.takePhoto()
      console.log(photo)
      setImage(photo)
    }
  },[])
  const switchCamera = useCallback(()=> {
    if (camera.current) {
      const result = camera.current.switchCamera()
      console.log(result)
    }
  },[])
  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [])

  return (
    <div className='camera-component'>
      {showImage ? (
        <div
          className='camera-full-screen-image-preview'
          style={{backgroundImage}}
          onClick={toggleImage}
        />
      ) : (
        <Camera
          ref={camera}
          aspectRatio={CAMERA_ASPECT_RATIO.COVER}
          numberOfCamerasCallback={setNumberOfCameras}
        />
      )}
      <div className='camera-controls'>
        <div
          className='camera-image-preview'
          style={{backgroundImage}}
          onClick={toggleImage}
        />
        <button 
          className={'camera-button camera-full-screen-button'}
          onClick={toggleFullScreen}
        />
        <button
          className={'camera-button camera-take-photo-button'}
          onClick={takePhoto}
        />
        <button
          className={'camera-button camera-change-facing-button'}
          disabled={numberOfCameras <= 1}
          onClick={switchCamera}
        />
      </div>
    </div>
  )
}

export default App
