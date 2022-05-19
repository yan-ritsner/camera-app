import _filter from 'lodash/filter'
import _isEqual from 'lodash/isEqual'
import _size from 'lodash/size'
import _forEach from 'lodash/forEach'

export const initCameraStream = async ({
  currentFacingMode,
  setStream,
  setNumberOfCameras,
  setNotSupported,
  setPermissionDenied,
}) => {

  const constraints = {
    audio: false,
    video: {
      facingMode: currentFacingMode,
      width: { ideal: 1920 },
      height: { ideal: 1920 },
    },
  }

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
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

export const handleTakePhoto = (player, container, canvas) => {
  if (!player || !container || !canvas) return

  const playerWidth = player.videoWidth || 1280
  const playerHeight = player.videoHeight || 720
  const playerAR = playerWidth / playerHeight

  const canvasWidth = container.offsetWidth || 1280
  const canvasHeight = container.offsetHeight || 1280
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
  const imgData = canvas.toDataURL('image/jpeg')
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