import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
} from 'react'
import classNames from 'classnames'
import _isEqual from 'lodash/isEqual'

import {
  CAMERA_ASPECT_RATIO,
  CAMERA_ERROR_MESSAGES,
  CAMERA_FACING_MODE
} from './Camera.constants'
import {
  initCameraStream,
  stopCameraStream,
  handleTakePhoto,
} from './Camera.helpers'
import './Camera.css'

export const Camera = React.forwardRef((props, ref) => {
  const {
    facingMode = CAMERA_FACING_MODE.USER,
    aspectRatio = CAMERA_ASPECT_RATIO.COVER,
    numberOfCamerasCallback = () => null,
  } = props

  const player = useRef(null)
  const canvas = useRef(null)
  const container = useRef(null)

  const [numberOfCameras, setNumberOfCameras] = useState(0)
  const [stream, setStream] = useState(null)
  const [currentFacingMode, setFacingMode] = useState(facingMode)
  const [notSupported, setNotSupported] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const isCoverRatio = _isEqual(aspectRatio, CAMERA_ASPECT_RATIO.COVER)
  const isUserFacing = _isEqual(currentFacingMode, CAMERA_FACING_MODE.USER)

  useEffect(() => {
    numberOfCamerasCallback(numberOfCameras)
  }, [numberOfCameras, numberOfCamerasCallback])

  useImperativeHandle(ref, () => ({
    takePhoto: () => {
      if (numberOfCameras < 1) {
        throw new Error(CAMERA_ERROR_MESSAGES.NO_CAMERA_ACCESSIBLE)
      } else if (!canvas.current) {
        throw new Error(CAMERA_ERROR_MESSAGES.CANVAS_NOT_SUPPORTED)
      }
      handleTakePhoto(player.current, container.current, canvas.current)
    },
    switchCamera: () => {
      if (numberOfCameras < 1) {
        throw new Error(CAMERA_ERROR_MESSAGES.NO_CAMERA_ACCESSIBLE)
      } else if (numberOfCameras < 2) {
        throw new Error(CAMERA_ERROR_MESSAGES.CANNOT_SWITCH_CAMERA)
      }
      const newFacingMode = isUserFacing
        ? CAMERA_FACING_MODE.ENVIRONMENT
        : CAMERA_FACING_MODE.USER
      stopCameraStream(stream)
      setFacingMode(newFacingMode)
      return newFacingMode
    },
    getNumberOfCameras: () => {
      return numberOfCameras
    },
  }))

  useEffect(() => {
    initCameraStream({
      currentFacingMode,
      setStream,
      setNumberOfCameras,
      setNotSupported,
      setPermissionDenied
    })
  }, [currentFacingMode])

  useEffect(() => {
    if (stream && player && player.current) {
      player.current.srcObject = stream
    }
    return () => {
      stopCameraStream(stream)
    }
  }, [stream])

  let errorMessage
  if (notSupported) {
    errorMessage = CAMERA_ERROR_MESSAGES.NO_CAMERA_ACCESSIBLE
  } else if (permissionDenied) {
    errorMessage = CAMERA_ERROR_MESSAGES.PERMISSION_DENIED
  }

  const containerClasses = classNames(
    'camera-container',
    { 'camera-container-cover': isCoverRatio }
  )
  const containerStyle = {
    paddingBottom: isCoverRatio ? `${100 / aspectRatio}%` : undefined
  }
  const videoClasses = classNames(
    'camera-video',
    { 'camera-video-mirrored': isUserFacing }
  )

  return (
    <div
      ref={container}
      className={containerClasses}
      style={containerStyle}>
      <div className='camera-wrapper'>
        {errorMessage && (
          <div className='camera-error'>
            {errorMessage}
          </div>
        )}
        <video
          id="video"
          ref={player}
          className={videoClasses}
          muted={true}
          autoPlay={true}
          playsInline={true}
        />
        <canvas
          ref={canvas}
          className='camera-canvas'
        />
      </div>
    </div>
  )
})

export default Camera

