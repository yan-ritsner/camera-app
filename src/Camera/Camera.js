import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react'
import classNames from 'classnames'
import _isEqual from 'lodash/isEqual'
import _size from 'lodash/size'

import {
  CAMERA_ASPECT_RATIO,
  CAMERA_FACING_MODE,
  CAMERA_DEFAULT_WIDTH,
  CAMERA_DEFAULT_HEIGHT,
  CAMERA_DEFAULT_FORMAT,
  CAMERA_DEFAULT_QUALITY,
  CAMERA_FILTERS,
  CAMERA_OVERLAY_SHAPE,
  CAMERA_STATE,
} from './Camera.constants'
import {
  initCameraStream,
  stopCameraStream,
  getNextCameraDeviceId,
  checkBestQualityCamera,
  takeCameraPhoto,
  setCameraSettings,
  getOverlayShapeProps,
  copySettingsToClipboard,
  getCameras,
  getFacingModeCameras,
} from './Camera.helpers'
import './Camera.css'
import CameraOverlay from './Camera.Overlay'
import { useElementSize, useGeolocation } from './Camera.hooks'

export const Camera = forwardRef((props, ref) => {
  const {
    facingMode = CAMERA_FACING_MODE.USER,
    aspectRatio = CAMERA_ASPECT_RATIO.COVER,
    width = CAMERA_DEFAULT_WIDTH,
    height = CAMERA_DEFAULT_HEIGHT,
    format = CAMERA_DEFAULT_FORMAT,
    quality = CAMERA_DEFAULT_QUALITY,
    filter = CAMERA_FILTERS.NONE,
    overlayShapeType = CAMERA_OVERLAY_SHAPE.NONE,
    overlayVisible = false,
    icon = '',
    title = '',
    subtitle = '',
    image = '',
    filename = '',
    shutterButtonVisible = false,
    primaryButtonVisible = false,
    secondaryButtonVisible = false,
    primaryButtonText = '',
    secondaryButtonText = '',
    camerasCallback = () => { },
    cameraCapabilitiesCallback = () => { },
    onTakePhoto = () => { },
    onPrimaryButtonClick = () => { },
    onSecondaryButtonClick = () => { },
  } = props

  const player = useRef(null)
  const canvas = useRef(null)
  const container = useRef(null)
  const controls = useRef(null)
  const isMounted = useRef(false)

  const [stream, setStream] = useState(null)
  const [deviceId, setDeviceId] = useState(null)
  const [cameraState, setCameraState] = useState()
  const [cameras, setCameras] = useState([])
  const [cameraCapabilities, setCameraCapabilities] = useState({})
  const [switchedCameras, setSwitchedCameras] = useState(0)
  const [notSupported, setNotSupported] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)

  const isCanceled = useCallback(() => !isMounted.current, [])
  const [geoPosition] = useGeolocation(isCanceled)

  const isCoverRatio = _isEqual(aspectRatio, CAMERA_ASPECT_RATIO.COVER)
  const isUserFacing = _isEqual(facingMode, CAMERA_FACING_MODE.USER)

  const {
    width: containerWidth,
    height: containerHeight
  } = useElementSize(container)
  const {
    width: controlsWidth,
    height: controlsHeight
  } = useElementSize(controls)
  const {
    overlayShapeProps = {},
    overlayShapeMargin = {}
  } = getOverlayShapeProps({
    type: overlayShapeType,
    width: containerWidth,
    height: containerHeight,
    controlsWidth,
    controlsHeight,
  })

  const takePhoto = () => {
    if (notSupported ||
      permissionDenied ||
      _size(cameras) < 1 ||
      !canvas.current
    ) {
      return
    }
    setIsFlashing(true)
    takeCameraPhoto({
      player: player.current,
      container: container.current,
      canvas: canvas.current,
      setPhoto: onTakePhoto,
      name: filename,
      mirorred: isUserFacing,
      dimensions: overlayShapeProps,
      format,
      quality,
      filter,
      geoPosition,
    })
  }

  const setSettings = (settings) => {
    setCameraSettings(stream, settings)
  }

  const copySettings = () => {
    copySettingsToClipboard(stream)
  }

  const initCamera = useCallback(() => {
    initCameraStream({
      facingMode,
      width,
      height,
      deviceId,
      setStream,
      setCameras,
      setCameraCapabilities,
      setNotSupported,
      setPermissionDenied,
      isCanceled,
    })
  }, [facingMode, width, height, deviceId, isCanceled])

  const stopCamera = useCallback(() => {
    stopCameraStream(stream)
    setStream(null)
  }, [stream])

  const switchCamera = useCallback((deviceId) => {
    let nextDeviceId = deviceId

    if (!nextDeviceId) {
      const facingModeCameras = getFacingModeCameras({
        cameras,
        facingMode,
      })
      nextDeviceId = getNextCameraDeviceId({
        cameras: facingModeCameras,
        cameraCapabilities,
        facingMode,
      })
    }

    if (nextDeviceId) {
      setDeviceId(nextDeviceId)
      setCameraState(CAMERA_STATE.RESTART)
    }
    return nextDeviceId
  }, [cameras, cameraCapabilities, facingMode])

  const adjustCamera = useCallback(() => {
    if (checkBestQualityCamera({
      cameraCapabilities,
      facingMode
    })) return

    const facingModeCameras = getFacingModeCameras({
      cameras,
      facingMode
    })

    const numberOfCameras = _size(facingModeCameras)
    if (numberOfCameras > 1 && switchedCameras < numberOfCameras) {
      switchCamera()
      setSwitchedCameras(value => value + 1)
    }
  }, [
    cameras,
    cameraCapabilities,
    facingMode,
    switchedCameras,
    switchCamera
  ])

  useImperativeHandle(ref, () => ({
    takePhoto,
    setSettings,
    copySettings,
    switchCamera,
    adjustCamera,
  }))

  useEffect(() => {
    camerasCallback(cameras)
  }, [cameras, camerasCallback])

  useEffect(() => {
    cameraCapabilitiesCallback(cameraCapabilities)
  }, [cameraCapabilities, cameraCapabilitiesCallback])

  useEffect(() => {
    if (player && player.current) {
      player.current.srcObject = stream
    }

    return () => {
      stopCameraStream(stream)
    }
  }, [stream])

  useEffect(() => {
    isMounted.current = true

    getCameras({
      setCameras,
      isCanceled,
    })
    setCameraState(CAMERA_STATE.START)

    return () => {
      isMounted.current = false
    }
  }, [isCanceled])

  useEffect(() => {
    setDeviceId(null)
    setSwitchedCameras(0)
    setCameraState(state =>
      !_isEqual(state, CAMERA_STATE.START)
        ? CAMERA_STATE.RESTART
        : state
    )
  }, [facingMode])

  useEffect(() => {
    switch (cameraState) {
      case CAMERA_STATE.START:
        console.log("START")
        setCameraState(CAMERA_STATE.STARTING)
        initCamera()
        break;
      case CAMERA_STATE.STARTING:
        if (stream) {
          setCameraState(CAMERA_STATE.STARTED)
        } else {
          console.log("STARTING")
        }
        break;
      case CAMERA_STATE.STARTED:
        adjustCamera()
        console.log("STARTED")
        break;
      case CAMERA_STATE.RESTART:
        console.log("RESTART")
        stopCamera()
        setCameraState(CAMERA_STATE.START)
        break;
      case CAMERA_STATE.STOP:
        console.log("STOP")
        stopCamera(stream)
        setCameraState(CAMERA_STATE.STOPPED)
        break;
      case CAMERA_STATE.STOPPED:
        console.log("STOPPED")
        break;
      default:
        break;
    }
  }, [
    cameraState,
    stream,
    initCamera,
    stopCamera,
    adjustCamera,
  ])

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
    x: overlayShapeLeft,
    y: overlayShapeTop,
    width: overlayShapeWidth,
    height: overlayShapeHeight,
    rx: overlayShapeBorderRadius,
  } = overlayShapeProps
  const imageStyle = {
    backgroundImage: `url(${image})`,
    left: overlayShapeLeft,
    top: overlayShapeTop,
    width: overlayShapeWidth,
    height: overlayShapeHeight,
    borderRadius: overlayShapeBorderRadius,
  }

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
            style={imageStyle}
          >
            <a href={image} download="image.jpg" id="embedImage"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000
              }}>
              Download
            </a>
          </div>
        )}
        {overlayVisible && (
          <CameraOverlay
            width={containerWidth}
            height={containerHeight}
            shapeType={overlayShapeType}
            shapeProps={overlayShapeProps}
            isFlashing={isFlashing}
            onStopFlashing={() => setIsFlashing(false)}
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
          <div className='camera-controls' ref={controls}>
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

