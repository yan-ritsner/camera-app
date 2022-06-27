import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react'
import classNames from 'classnames'
import _isEqual from 'lodash/isEqual'

import {
  CAMERA_ASPECT_RATIO,
  CAMERA_FACING_MODE,
  CAMERA_DEFAULT_WIDTH,
  CAMERA_DEFAULT_HEIGHT,
  CAMERA_DEFAULT_FORMAT,
  CAMERA_DEFAULT_QUALITY,
  CAMERA_FILTERS,
  CAMERA_OVERLAY_SHAPE,
} from './Camera.constants'
import {
  initCameraStream,
  stopCameraStream,
  takeCameraPhoto,
  setCameraSettings,
  getOverlayShapeProps,
} from './Camera.helpers'
import './Camera.css'
import CameraOverlay from './Camera.Overlay'
import { useElementSize } from './Camera.hooks'

export const Camera = forwardRef((props, ref) => {
  const {
    facingMode = CAMERA_FACING_MODE.USER,
    aspectRatio = CAMERA_ASPECT_RATIO.COVER,
    width = CAMERA_DEFAULT_WIDTH,
    height = CAMERA_DEFAULT_HEIGHT,
    format = CAMERA_DEFAULT_FORMAT,
    quality = CAMERA_DEFAULT_QUALITY,
    filter = CAMERA_FILTERS.SHARPEN,
    overlayShapeType = CAMERA_OVERLAY_SHAPE.NONE,
    overlayVisible = false,
    icon = '',
    title = '',
    subtitle = '',
    image = '',
    shutterButtonVisible = false,
    primaryButtonVisible = false,
    secondaryButtonVisible = false,
    primaryButtonText = '',
    secondaryButtonText = '',
    numberOfCamerasCallback = () => { },
    cameraCapabilitiesCallback = () => { },
    onTakePhoto = () => { },
    onPrimaryButtonClick = () => { },
    onSecondaryButtonClick = () => { },
  } = props

  const player = useRef(null)
  const canvas = useRef(null)
  const container = useRef(null)

  const [stream, setStream] = useState(null)
  const [numberOfCameras, setNumberOfCameras] = useState(0)
  const [notSupported, setNotSupported] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [cameraCapabilities, setCameraCapabilities] = useState({})

  const isCoverRatio = _isEqual(aspectRatio, CAMERA_ASPECT_RATIO.COVER)
  const isUserFacing = _isEqual(facingMode, CAMERA_FACING_MODE.USER)

  const takePhoto = () => {
    if (notSupported ||
      permissionDenied ||
      numberOfCameras < 1 ||
      !canvas.current
    ) {
      return
    }
    const photo = takeCameraPhoto({
      player: player.current,
      container: container.current,
      canvas: canvas.current,
      mirorred: isUserFacing,
      format,
      quality,
      filter,
    })
    onTakePhoto(photo)
    return photo
  }

  const setSettings = (settings) => {
    setCameraSettings(stream, settings)
  }

  useImperativeHandle(ref, () => ({
    takePhoto,
    setSettings,
  }))

  useEffect(() => {
    numberOfCamerasCallback(numberOfCameras)
  }, [numberOfCameras, numberOfCamerasCallback])

  useEffect(() => {
    cameraCapabilitiesCallback(cameraCapabilities)
  }, [cameraCapabilities, cameraCapabilitiesCallback])

  useEffect(() => {
    setStream((stream) => {
      stopCameraStream(stream)
      return null
    })
    initCameraStream({
      facingMode,
      width,
      height,
      setStream,
      setNumberOfCameras,
      setNotSupported,
      setPermissionDenied,
      setCameraCapabilities,
    })
  }, [facingMode, width, height])

  useEffect(() => {
    if (stream && player && player.current) {
      player.current.srcObject = stream
    }
    return () => {
      stopCameraStream(stream)
    }
  }, [stream])

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
  const {
    overlayShapeProps = {},
    overlayShapeMargin = {}
  } = getOverlayShapeProps({
    type: overlayShapeType,
    width: containerWidth,
    height: containerHeight
  })

  return (
    <div
      ref={container}
      className={containerClasses}
      style={containerStyle}>
      <div className='camera-wrapper'>
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
        {image && (
          <div
            className='camera-image'
            style={{ backgroundImage: `url(${image})` }}
          />
        )}
        {overlayVisible && (
          <CameraOverlay
            width={containerWidth}
            height={containerHeight}
            shapeType={overlayShapeType}
            shapeProps={overlayShapeProps}
          />
        )}
        <div
          className='camera-content'
          style={{ ...overlayShapeMargin }}
        >
          {icon && (
            <div className='camera-icon'>
              {icon}
            </div>
          )}
          <div className='camera-controls'>
            {title && (
              <div className='camera-title'>
                {title}
              </div>
            )}
            {subtitle && (
              <div className='camera-subtitle'>
                {subtitle}
              </div>
            )}
            <div className='camera-controls-spacer'></div>
            {shutterButtonVisible && (
              <button
                type='button'
                className='camera-shutter-button'
                onClick={takePhoto}
              />
            )}
            {primaryButtonVisible && (
              <button
                type='button'
                className='camera-action-button camera-action-button-primary'
                onClick={onPrimaryButtonClick}
              >
                {primaryButtonText}
              </button>
            )}
            {secondaryButtonVisible && (
              <button
                type='button'
                className='camera-action-button camera-action-button-secondary'
                onClick={onSecondaryButtonClick}
              >
                {secondaryButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default Camera

