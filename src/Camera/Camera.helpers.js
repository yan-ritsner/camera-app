import _filter from 'lodash/filter'
import _isEqual from 'lodash/isEqual'
import _size from 'lodash/size'
import _forEach from 'lodash/forEach'

import {
  CAMERA_DEFAULT_WIDTH,
  CAMERA_DEFAULT_HEIGHT,
  CAMERA_FILTERS,
} from './Camera.constants'

export const initCameraStream = async ({
  currentFacingMode,
  width,
  height,
  setStream,
  setNumberOfCameras,
  setNotSupported,
  setPermissionDenied,
  setCameraCapabilities,
}) => {

  const constraints = {
    audio: false,
    video: {
      facingMode: currentFacingMode,
      width: { ideal: width },
      height: { ideal: height },
    },
  }

  const mediaDevices = navigator.mediaDevices
  if (mediaDevices && mediaDevices.getUserMedia) {
    try {
      const stream = await mediaDevices.getUserMedia(constraints)
      handleSuccess(stream, setStream, setNumberOfCameras, setCameraCapabilities)
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
        handleSuccess(stream, setStream, setNumberOfCameras, setCameraCapabilities)
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

export const takeCameraPhoto = ({
  player,
  container,
  canvas,
  mirorred,
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

  canvas.width = sW
  canvas.height = sH

  const context = canvas.getContext('2d')

  if (mirorred) {
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
  }

  context.drawImage(player, sX, sY, sW, sH, 0, 0, sW, sH)

  if (filter && !_isEqual(filter, CAMERA_FILTERS.NONE)) {
    const sourceImageData = context.getImageData(0, 0, sW, sH)
    const blankOutputImageData = context.createImageData(sW, sH)
    const outputImageData = applyCameraFilter(sourceImageData, blankOutputImageData, filter)
    context.putImageData(outputImageData, 0, 0)
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

const handleSuccess = async (stream, setStream, setNumberOfCameras, setCameraCapabilities) => {
  const allDevices = await navigator.mediaDevices.enumerateDevices()
  const videoDevices = _filter(allDevices, device => _isEqual(device.kind, 'videoinput'))
  const capabilities = getCameraCapabilities(stream)

  printCameraSettings(stream)
  setNumberOfCameras(_size(videoDevices))
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