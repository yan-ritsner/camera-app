import React, { useState, useRef, useCallback, useEffect } from "react"

import { Camera } from "./Camera"
import { 
  CAMERA_ASPECT_RATIO, 
  CAMERA_FILTERS, 
  CAMERA_FOCUS_MODE 
} from "./Camera/Camera.constants"

import './App.css'


const App = () => {
  const [numberOfCameras, setNumberOfCameras] = useState(0)
  const [image, setImage] = useState(null)
  const [showImage, setShowImage] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [applyFilter, setApplyFilter] = useState(true)
  const [manualFocus, setManualFocus] = useState(false)
  const [focusDistance, setFocusDistance] = useState(0)
  const [cameraCapabilities, setCameraCapabilities] = useState()
  const camera = useRef(null)

  const {
    focusDistance : focusDistanceCapabilities = {}
  } = cameraCapabilities || {}

  const {
    min: focusDistanceMin, 
    max: focusDistanceMax,
    step: focusDistanceStep,
  }  = focusDistanceCapabilities

  useEffect(()=> {
    if (!camera.current || !cameraCapabilities) return

    camera.current.setCameraSettings({
      advanced: [{
        focusMode:  manualFocus 
          ? CAMERA_FOCUS_MODE.MANUAL 
          : CAMERA_FOCUS_MODE.CONTINUOUS,
        focusDistance: manualFocus 
          ? focusDistance || focusDistanceMin
          :undefined,
      }]
    })
  },[manualFocus, focusDistance, focusDistanceMin, cameraCapabilities])


  const toggleImage  = useCallback(()=>{
    setShowImage((value) => !value)
  }, [])
  const toggleSettings  = useCallback(()=>{
    setShowSettings((value) => !value)
  }, [])
  const toggleFilter  = useCallback(()=>{
    setApplyFilter((value) => !value)
  }, [])
  const toggleManualFocus = useCallback(()=>{
    setManualFocus((value) => !value)
  }, [])

  const takePhoto = useCallback(()=> {
    if (!camera.current) return

    const photo = camera.current.takePhoto()
    console.log(photo)
    setImage(photo)
  },[])
  const switchCamera = useCallback(()=> {
    if (!camera.current) return

    const result = camera.current.switchCamera()
    console.log(result)
  },[])

  const backgroundImage = image ? `url(${image})` : ''

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
          cameraCapabilitiesCallback={setCameraCapabilities}
          filter={applyFilter ? CAMERA_FILTERS.SHARPEN: CAMERA_FILTERS.NONE}
        />
      )}
      <div className='camera-controls'>
        <div
          className='camera-image-preview'
          style={{backgroundImage}}
          onClick={toggleImage}
        />
        <button
          className='camera-button camera-take-photo-button'
          onClick={takePhoto}
        />
        <button
          className='camera-button camera-change-facing-button'
          disabled={numberOfCameras <= 1}
          onClick={switchCamera}
        />
      </div>
      <button
        className='camera-button camera-settings-button'
        onClick={toggleSettings}
      
      />
      {showSettings && (
        <div className='camera-settings'>
          <div>Settings</div>
          <div>
            <label htmlFor="filter">
              Apply Filter
            </label>
            <input 
              type="checkbox" 
              id="filter" 
              name="filter" 
              checked={applyFilter} 
              onChange={toggleFilter}
            />
          </div>
          <div>
            <label htmlFor="manualFocus">
              Manual Focus
            </label>
            <input 
              type="checkbox" 
              id="manualFocus" 
              name="manualFocus" 
              checked={manualFocus} 
              onChange={toggleManualFocus}
            />
          </div>
          <div>
            <label htmlFor="focusDistance">
              Focus Distance
            </label>
            <input 
              type="range" 
              id="focusDistance" 
              name="focusDistance"    
              min={focusDistanceMin}
              max={focusDistanceMax}
              step={focusDistanceStep}
              value={focusDistance}
              onChange={(e)=> setFocusDistance(e.target.value)}
            />
          </div>
          <div>{focusDistance}</div>
        </div>
      )}
    </div>
  )
}

export default App
