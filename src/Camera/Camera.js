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
  CAMERA_FACING_MODE,
  CAMERA_DEFAULT_WIDTH,
  CAMERA_DEFAULT_HEIGHT,
  CAMERA_DEFAULT_FORMAT,
  CAMERA_DEFAULT_QUALITY,
  CAMERA_FILTERS,
  CAMERA_OVERLAY_SHAPE,
  CAMERA_RECT_RATIO
} from './Camera.constants'
import {
  initCameraStream,
  stopCameraStream,
  takeCameraPhoto,
  setCameraSettings,
} from './Camera.helpers'
import './Camera.css'
import CameraOverlay from './Camera.Overlay'
import { useElementSize } from './Camera.hooks'

export const Camera = React.forwardRef((props, ref) => {
  const {
    facingMode = CAMERA_FACING_MODE.USER,
    aspectRatio = CAMERA_ASPECT_RATIO.COVER,
    width = CAMERA_DEFAULT_WIDTH,
    height = CAMERA_DEFAULT_HEIGHT,
    format = CAMERA_DEFAULT_FORMAT,
    quality = CAMERA_DEFAULT_QUALITY,
    filter = CAMERA_FILTERS.SHARPER,
    numberOfCamerasCallback = () => 0,
    cameraCapabilitiesCallback = () => ({})
  } = props

  const player = useRef(null)
  const canvas = useRef(null)
  const container = useRef(null)

  const [numberOfCameras, setNumberOfCameras] = useState(0)
  const [cameraCapabilities, setCameraCapabilities] = useState({})
  const [stream, setStream] = useState(null)
  const [currentFacingMode, setFacingMode] = useState(facingMode)
  const [notSupported, setNotSupported] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)

  const isCoverRatio = _isEqual(aspectRatio, CAMERA_ASPECT_RATIO.COVER)
  const isUserFacing = _isEqual(currentFacingMode, CAMERA_FACING_MODE.USER)

  useEffect(() => {
    numberOfCamerasCallback(numberOfCameras)
  }, [numberOfCameras, numberOfCamerasCallback])

  useEffect(() => {
    cameraCapabilitiesCallback(cameraCapabilities)
  }, [cameraCapabilities, cameraCapabilitiesCallback])

  useImperativeHandle(ref, () => ({
    takePhoto: () => {
      if (numberOfCameras < 1) {
        throw new Error(CAMERA_ERROR_MESSAGES.NO_CAMERA_ACCESSIBLE)
      } else if (!canvas.current) {
        throw new Error(CAMERA_ERROR_MESSAGES.CANVAS_NOT_SUPPORTED)
      }
      return takeCameraPhoto({
        player: player.current,
        container: container.current,
        canvas: canvas.current,
        mirorred: isUserFacing,
        format,
        quality,
        filter,
      })
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
    getCameraCapabilities: () => {
      return cameraCapabilities
    },
    setCameraSettings: (settings) => {
      setCameraSettings(stream, settings)
    }
  }))

  useEffect(() => {
    initCameraStream({
      currentFacingMode,
      width,
      height,
      setStream,
      setNumberOfCameras,
      setNotSupported,
      setPermissionDenied,
      setCameraCapabilities,
    })
  }, [currentFacingMode, width, height])

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

  const {
    width: containerWidth,
    height: containerHeight
  } = useElementSize(container)

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
          id='canvas'
          ref={canvas}
          className={'camera-canvas'}
        />
        <CameraOverlay
          width={containerWidth}
          height={containerHeight}
          shapeType={CAMERA_OVERLAY_SHAPE.RECT}
          shapeRatio={CAMERA_RECT_RATIO.CARD}
          shapeHMargin={20}
          shapeVMargin={100}
          shapeBorderRadius={10}
        />
      </div>
    </div>
  )
})

export default Camera

