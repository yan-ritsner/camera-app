import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react'
import classNames from 'classnames'
import _isEqual from 'lodash/isEqual'
import _filter from 'lodash/filter'
import _findIndex from 'lodash/findIndex'
import _size from 'lodash/size'
import _get from 'lodash/get'
import _includes from 'lodash/includes'


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
  copySettingsToClipboard,
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
    filter = CAMERA_FILTERS.NONE,
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
    camerasCallback = () => { },
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
  const [cameras, setCameras] = useState([])
  const [numberOfCameras, setNumberOfCameras] = useState(0)
  const [cameraCapabilities, setCameraCapabilities] = useState({})
  const [notSupported, setNotSupported] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)

  const isCoverRatio = _isEqual(aspectRatio, CAMERA_ASPECT_RATIO.COVER)
  const isUserFacing = _isEqual(facingMode, CAMERA_FACING_MODE.USER)

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

  const takePhoto = () => {
    if (notSupported ||
      permissionDenied ||
      numberOfCameras < 1 ||
      !canvas.current
    ) {
      return
    }
    setIsFlashing(true)
    const photo = takeCameraPhoto({
      player: player.current,
      container: container.current,
      canvas: canvas.current,
      mirorred: isUserFacing,
      dimensions: overlayShapeProps,
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

  const copySettings = () => {
    copySettingsToClipboard(stream)
  }

  const switchCamera = () => {
    const { deviceId: currDeviceId } = cameraCapabilities
    if (!currDeviceId) return

    const sameFacingModeCameras = _filter(
      cameras,
      (camera) => {
        const {
          facingMode: cameraFacingMode
        } = camera.getCapabilities()
        return _includes(cameraFacingMode, facingMode)
      },
    )
    const currCameraIndex = _findIndex(
      sameFacingModeCameras,
      ({ deviceId }) => _isEqual(deviceId, currDeviceId)
    )

    if (currCameraIndex < 0) return
    const nextCameraIndex =
      currCameraIndex + 1 <= _size(sameFacingModeCameras) - 1
        ? currCameraIndex + 1
        : 0

    const {
      deviceId: nextDeviceId
    } = _get(sameFacingModeCameras, nextCameraIndex, {})
    if (_isEqual(nextDeviceId, currDeviceId) || !nextDeviceId) return

    stopCameraStream(stream)
    if (player && player.current) {
      player.current.srcObject = null
    }
    setStream(null)

    initCameraStream({
      facingMode,
      width,
      height,
      deviceId: nextDeviceId,
      setStream,
      setCameras,
      setNumberOfCameras,
      setCameraCapabilities,
      setNotSupported,
      setPermissionDenied,
    })
  }

  useImperativeHandle(ref, () => ({
    takePhoto,
    setSettings,
    copySettings,
    switchCamera,
  }))

  useEffect(() => {
    camerasCallback(cameras)
  }, [cameras, camerasCallback])

  useEffect(() => {
    numberOfCamerasCallback(numberOfCameras)
  }, [numberOfCameras, numberOfCamerasCallback])

  useEffect(() => {
    cameraCapabilitiesCallback(cameraCapabilities)
  }, [cameraCapabilities, cameraCapabilitiesCallback])

  useEffect(() => {
    setStream((stream) => {
      stopCameraStream(stream)
      if (player && player.current) {
        player.current.srcObject = null
      }
      return null
    })

    initCameraStream({
      facingMode,
      width,
      height,
      setStream,
      setCameras,
      setNumberOfCameras,
      setCameraCapabilities,
      setNotSupported,
      setPermissionDenied,
    })
  }, [facingMode, width, height])

  useEffect(() => {
    if (player && player.current) {
      player.current.srcObject = stream
    }
    return () => {
      stopCameraStream(stream)
    }
  }, [stream, facingMode, width, height])

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
            <a href={image} download="image.png" id="embedImage"
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

