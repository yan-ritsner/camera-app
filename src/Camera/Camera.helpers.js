import _filter from 'lodash/filter'
import _isEqual from 'lodash/isEqual'
import _size from 'lodash/size'
import _forEach from 'lodash/forEach'
import _isEmpty from 'lodash/isEmpty'
import _includes from 'lodash/includes'
import _findIndex from 'lodash/findIndex'
import _get from 'lodash/get'

import {
  CAMERA_DEFAULT_WIDTH,
  CAMERA_DEFAULT_HEIGHT,
  CAMERA_FILTERS,
  CAMERA_RECT_RATIO,
  CAMERA_OVERLAY_SHAPE,
  CAMERA_FOCUS_MODE,
} from './Camera.constants'

export const getCameras = async (setCameras) => {
  const mediaDevices = navigator.mediaDevices
  if (!mediaDevices || !mediaDevices.enumerateDevices) {
    return
  }

  const allDevices = await mediaDevices.enumerateDevices()
  const videoDevices = _filter(
    allDevices,
    device => _isEqual(device.kind, 'videoinput')
  )
  setCameras(videoDevices)
}

export const initCameraStream = async ({
  facingMode,
  width,
  height,
  deviceId,
  setStream,
  setCameraCapabilities,
  setNotSupported,
  setPermissionDenied,
}) => {
  console.log('INIT')
  const deviceConstraints = deviceId ? {
    deviceId: {
      exact: deviceId
    }
  } : {}

  const constraints = {
    audio: false,
    video: {
      facingMode,
      width: { ideal: width },
      height: { ideal: height },
      ...deviceConstraints
    }
  }

  const mediaDevices = navigator.mediaDevices
  if (mediaDevices && mediaDevices.getUserMedia) {
    try {
      const stream = await mediaDevices.getUserMedia(constraints)
      handleSuccess(
        stream,
        setStream,
        setCameraCapabilities
      )
    }
    catch (err) {
      handleError(err, setNotSupported, setPermissionDenied)
    }
    return
  }

  const getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia

  if (getUserMedia) {
    getUserMedia(
      constraints,
      stream => {
        handleSuccess(
          stream,
          setStream,
          setCameraCapabilities
        )
      },
      err => {
        handleError(err, setNotSupported, setPermissionDenied)
      },
    )
  } else {
    setNotSupported(true)
  }
}

export const stopCameraStream = (stream) => {
  if (!stream) return

  const tracks = stream.getTracks()
  _forEach(tracks, track => {
    track.stop()
  })
}

export const getNextCameraDeviceId = ({
  cameras,
  cameraCapabilities,
  facingMode
}) => {
  const { deviceId: currDeviceId } = cameraCapabilities
  if (!currDeviceId) return

  const filteredCameras = _filter(
    cameras,
    (camera) => {
      if (!camera.getCapabilities) return true
      const { facingMode: cameraFacingMode } = camera.getCapabilities()
      return _includes(cameraFacingMode, facingMode)
    },
  )

  const currCameraIndex = _findIndex(
    filteredCameras,
    ({ deviceId }) => _isEqual(deviceId, currDeviceId)
  )
  if (currCameraIndex < 0) return

  let nextCameraIndex = currCameraIndex + 1
  if (nextCameraIndex > _size(filteredCameras) - 1) {
    nextCameraIndex = 0
  }

  const { deviceId: nextDeviceId } = _get(filteredCameras, nextCameraIndex, {})
  if (_isEqual(nextDeviceId, currDeviceId) || !nextDeviceId) return

  return nextDeviceId
}

export const checkBestQualityCamera = ({
  cameraCapabilities,
  facingMode,
}) => {
  if (_isEmpty(cameraCapabilities)) return true

  const {
    facingMode: cameraFacingMode = [],
    focusMode: cameraFocusMode = [],
    focusDistance: cameraFocusDistance = {}
  } = cameraCapabilities
  const { max: maxFocusDistance = 0 } = cameraFocusDistance

  return (
    _includes(cameraFacingMode, facingMode) &&
    _includes(cameraFocusMode, CAMERA_FOCUS_MODE.CONTINUOUS) &&
    maxFocusDistance > 1
  )
}

export const takeCameraPhoto = ({
  player,
  container,
  canvas,
  mirorred,
  dimensions,
  format,
  quality,
  filter,
}) => {
  if (!player || !container || !canvas) return

  const playerWidth = player.videoWidth || CAMERA_DEFAULT_WIDTH
  const playerHeight = player.videoHeight || CAMERA_DEFAULT_HEIGHT
  const playerAR = playerWidth / playerHeight

  const canvasWidth = container.offsetWidth || CAMERA_DEFAULT_WIDTH
  const canvasHeight = container.offsetHeight || CAMERA_DEFAULT_HEIGHT
  const canvasAR = canvasWidth / canvasHeight

  let sX, sY, sW, sH

  if (playerAR > canvasAR) {
    sH = playerHeight
    sW = playerHeight * canvasAR
    sX = (playerWidth - sW) / 2
    sY = 0
  } else {
    sW = playerWidth
    sH = playerWidth / canvasAR
    sX = 0
    sY = (playerHeight - sH) / 2
  }

  if (!_isEmpty(dimensions)) {
    const { x, y, width, height } = dimensions
    sX = sX + (x / canvasWidth * sW)
    sY = sY + (y / canvasHeight * sH)
    sW = (width / canvasWidth * sW)
    sH = (height / canvasHeight * sH)
  }

  canvas.width = sW
  canvas.height = sH

  const context = canvas.getContext('2d')

  if (mirorred) {
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
  }

  context.drawImage(player, sX, sY, sW, sH, 0, 0, sW, sH)

  if (filter && !_isEqual(filter, CAMERA_FILTERS.NONE)) {
    const sourceData = context.getImageData(0, 0, sW, sH)
    const blankData = context.createImageData(sW, sH)
    const outputData = applyCameraFilter(sourceData, blankData, filter)
    context.putImageData(outputData, 0, 0)
  }

  const imgDataUrl = canvas.toDataURL(format, quality)
  return imgDataUrl
}

export const getCameraTrack = (stream) => {
  if (!stream) return
  const [track] = stream.getTracks()
  return track
}

export const getCameraCapabilities = (stream) => {
  const track = getCameraTrack(stream)
  if (!track) return

  const capabilities = track.getCapabilities()
  return capabilities
}

export const setCameraSettings = (stream, settings) => {
  const track = getCameraTrack(stream)
  if (!track) return

  track.applyConstraints(settings)
  printCameraSettings(stream)
}

export const printCameraSettings = (stream) => {
  const track = getCameraTrack(stream)
  if (!track) return

  const capabilities = track.getCapabilities()
  const constraints = track.getConstraints()
  const settings = track.getSettings()

  console.log('capabilities:')
  console.log(capabilities)
  console.log('constraints:')
  console.log(constraints)
  console.log('settings:')
  console.log(settings)
}


export const copySettingsToClipboard = (stream) => {
  const track = getCameraTrack(stream)
  if (!track) return

  const capabilities = track.getCapabilities()
  const constraints = track.getConstraints()
  const settings = track.getSettings()

  const data = {
    capabilities,
    constraints,
    settings
  }

  const text = JSON.stringify(data)

  if (!navigator.clipboard) return

  navigator.clipboard.writeText(text).then(function () {
    alert('Copied to clipboard')
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
}

export const applyCameraFilter = (
  sourceImageData,
  outputImageData,
  filter
) => {
  switch (filter) {
    case CAMERA_FILTERS.SHARPEN: {
      const filterData = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ]
      return applyConvolution(sourceImageData, outputImageData, filterData)
    }
    default:
      return sourceImageData
  }
}

export const getCircleOverlayProps = ({
  width,
  height,
  hmargin = 20,
  vmargin = 50,
}) => {
  const minSize = Math.min(width, height)
  const circleR = Math.max(minSize / 2 - hmargin, 0)
  let circleX
  let circleY
  let circleMargin

  if (height > width) {
    circleX = '50%'
    circleY = circleR + vmargin
    circleMargin = {
      top: circleY + circleR
    }
  } else {
    circleX = circleR + vmargin
    circleY = '50%'
    circleMargin = {
      left: circleX + circleR
    }
  }

  return {
    overlayShapeProps: {
      cx: circleX,
      cy: circleY,
      r: circleR,
    },
    overlayShapeMargin: circleMargin,
  }
}

export const getRectOverlayProps = ({
  width,
  height,
  ratio,
  borderRadius = 0,
  hmargin = 20,
  vmargin = 50,
}) => {
  let rectWidth
  let rectHeight
  let rectX
  let rectY
  let rectMargin

  if (height > width) {
    rectWidth = Math.max(width - (hmargin * 2), 0)
    rectHeight = rectWidth / ratio
    rectX = (width - rectWidth) / 2
    rectY = vmargin
    rectMargin = {
      top: rectY + rectHeight
    }
  } else {
    rectHeight = Math.max(height - (hmargin * 2), 0)
    rectWidth = rectHeight * ratio
    rectX = vmargin
    rectY = (height - rectHeight) / 2
    rectMargin = {
      left: rectX + rectWidth
    }
  }

  return {
    overlayShapeProps: {
      width: rectWidth,
      height: rectHeight,
      x: rectX,
      y: rectY,
      rx: borderRadius,
    },
    overlayShapeMargin: rectMargin,
  }
}

export const getOverlayShapeProps = ({
  type,
  width,
  height,
}) => {
  let overlayShapeProps
  switch (type) {
    case CAMERA_OVERLAY_SHAPE.CIRCLE:
      overlayShapeProps = getRectOverlayProps({
        width,
        height,
        ratio: CAMERA_RECT_RATIO.SQUARE,
        borderRadius: '50%',
      })
      break
    case CAMERA_OVERLAY_SHAPE.RECT:
      overlayShapeProps = getRectOverlayProps({
        width,
        height,
        ratio: CAMERA_RECT_RATIO.CARD,
        borderRadius: 10,
      })
      break
    default:
      overlayShapeProps = {}
      break
  }
  return overlayShapeProps
}

const applyConvolution = (
  sourceImageData,
  outputImageData,
  kernel
) => {

  const {
    data: src,
    width: srcWidth,
    height: srcHeight
  } = sourceImageData

  const {
    data: dst,
  } = outputImageData

  const side = Math.round(Math.sqrt(_size(kernel)))
  const halfSide = Math.floor(side / 2)

  // padding the output by the convolution kernel
  const w = srcWidth
  const h = srcHeight

  // iterating through the output image pixels
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0

      // calculating the weighed sum of the source image pixels that
      // fall under the convolution kernel
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = y + cy - halfSide
          const scx = x + cx - halfSide

          if (scy >= 0 && scy < srcHeight && scx >= 0 && scx < srcWidth) {
            let srcOffset = (scy * srcWidth + scx) * 4
            let wt = kernel[cy * side + cx]
            r += src[srcOffset] * wt
            g += src[srcOffset + 1] * wt
            b += src[srcOffset + 2] * wt
            a += src[srcOffset + 3] * wt
          }
        }
      }

      const dstOffset = (y * w + x) * 4

      dst[dstOffset] = r
      dst[dstOffset + 1] = g
      dst[dstOffset + 2] = b
      dst[dstOffset + 3] = a
    }
  }

  return outputImageData
}

const handleSuccess = async (stream, setStream, setCameraCapabilities) => {
  // printCameraSettings(stream)
  const capabilities = getCameraCapabilities(stream)
  setCameraCapabilities(capabilities)
  setStream(stream)
}

const handleError = (error, setNotSupported, setPermissionDenied) => {
  console.error(error)

  //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  if (error.name === 'PermissionDeniedError') {
    setPermissionDenied(true)
  } else {
    setNotSupported(true)
  }
}