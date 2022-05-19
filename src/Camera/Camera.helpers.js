import _filter from 'lodash/filter'
import _isEqual from 'lodash/isEqual'
import _size from 'lodash/size'
import _forEach from 'lodash/forEach'

import {
  CAMERA_DEFAULT_WIDTH,
  CAMERA_DEFAULT_HEIGHT,
} from './Camera.constants'

export const initCameraStream = async ({
  currentFacingMode,
  idealWidth,
  idealHeight,
  setStream,
  setNumberOfCameras,
  setNotSupported,
  setPermissionDenied,
}) => {

  const constraints = {
    audio: false,
    video: {
      facingMode: currentFacingMode,
      width: { ideal: idealWidth },
      height: { ideal: idealHeight },
    },
  }

  const mediaDevices = navigator.mediaDevices
  if (mediaDevices && mediaDevices.getUserMedia) {
    try {
      const stream = await mediaDevices.getUserMedia(constraints)
      handleSuccess(stream, setStream, setNumberOfCameras)
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
        handleSuccess(stream, setStream, setNumberOfCameras)
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

export const handleTakePhoto = ({
    player, 
    container, 
    canvas, 
    format, 
    quality
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
  context.drawImage(player, sX, sY, sW, sH, 0, 0, sW, sH)
  const imgData = canvas.toDataURL(format, quality)
  return imgData
}

const handleSuccess = async (stream, setStream, setNumberOfCameras) => {
  const allDevices = await navigator.mediaDevices.enumerateDevices()
  const videoDevices = _filter(allDevices, device => _isEqual(device.kind, 'videoinput'))

  setNumberOfCameras(_size(videoDevices))
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