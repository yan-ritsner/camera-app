import React, { useState } from "react"

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

  const toggleFacingMode = () => {
    setFacingMode(
      facingMode === CAMERA_FACING_MODE.USER
        ? CAMERA_FACING_MODE.ENVIRONMENT
        : CAMERA_FACING_MODE.USER
    )
  }

  const onTakePhoto = (photo) => {
    setImage(photo)
  }
  const onRetakePhoto = () => {
    setImage('')
  }

  const overlayShape = facingMode === CAMERA_FACING_MODE.USER
    ? CAMERA_OVERLAY_SHAPE.CIRCLE
    : CAMERA_OVERLAY_SHAPE.RECT

  return (
    <>
      <Camera
        image={image}
        facingMode={facingMode}
        aspectRatio={CAMERA_ASPECT_RATIO.COVER}
        filter={CAMERA_FILTERS.SHARPEN}
        overlayShapeType={overlayShape}
        overlayVisible
        shutterButtonVisible
        primaryButtonVisible
        primaryButtonText='Retake Photo'
        onTakePhoto={onTakePhoto}
        onPrimaryButtonClick={onRetakePhoto}
      />
      <button
        style={{ position: 'absolute' }}
        type="button"
        onClick={toggleFacingMode}>
        Change Facing Mode
      </button>
    </>
  )
}

export default App
