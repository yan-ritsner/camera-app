import React, { useRef, useState } from "react"

import { Camera } from "./Camera"
import {
  CAMERA_ASPECT_RATIO,
  CAMERA_FACING_MODE,
  CAMERA_FILTERS,
  CAMERA_OVERLAY_SHAPE
} from "./Camera/Camera.constants"

const App = () => {
  const [image, setImage] = useState('')
  const [facingMode, setFacingMode] = useState(CAMERA_FACING_MODE.USER)
  const cameraRef = useRef();

  const toggleFacingMode = () => {
    setFacingMode(
      facingMode === CAMERA_FACING_MODE.USER
        ? CAMERA_FACING_MODE.ENVIRONMENT
        : CAMERA_FACING_MODE.USER
    )
  }

  const copySettings = () => {
    cameraRef.current.copySettings()
  }

  const switchCamera = () => {
    cameraRef.current.switchCamera()
  }

  const onTakePhoto = (photo) => {
    const photoUrl = URL.createObjectURL(photo)
    setImage(photoUrl)
  }
  const onRetakePhoto = () => {
    setImage('')
  }

  const overlayShape = facingMode === CAMERA_FACING_MODE.USER
    ? CAMERA_OVERLAY_SHAPE.CIRCLE
    : CAMERA_OVERLAY_SHAPE.RECT

  return (
    <div>
      <Camera
        ref={cameraRef}
        image={image}
        facingMode={facingMode}
        aspectRatio={CAMERA_ASPECT_RATIO.COVER}
        filter={CAMERA_FILTERS.NONE}
        title={"Title"}
        subtitle={"Subtitle"}
        overlayShapeType={overlayShape}
        overlayVisible
        shutterButtonVisible
        primaryButtonVisible
        primaryButtonText='Retake Photo'
        onTakePhoto={onTakePhoto}
        onPrimaryButtonClick={onRetakePhoto}
      />

      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: '5px',
        boxSizing: 'border-box'
      }}>
        <button
          type="button"
          onClick={toggleFacingMode}>
          Change Facing Mode
        </button>

        <button
          type="button"
          onClick={switchCamera}>
          Switch Camera
        </button>

        <button
          type="button"
          onClick={copySettings}>
          Copy Settings
        </button>
      </div>

    </div>
  )
}

export default App
