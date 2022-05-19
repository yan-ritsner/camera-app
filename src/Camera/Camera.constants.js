export const CAMERA_FACING_MODE = {
  USER: 'user',
  ENVIRONMENT: 'environment',
}

export const CAMERA_ASPECT_RATIO = {
  COVER: 'cover'
}

export const CAMERA_ERROR_MESSAGES = {
  NO_CAMERA_ACCESSIBLE: 'No camera device accessible. Please connect your camera or try a different browser.',
  PERMISSION_DENIED: 'Permission denied. Please refresh and give camera permission.',
  CANNOT_SWITCH_CAMERA: 'It is not possible to switch camera to different one because there is only one video device accessible.',
  CANVAS_NOT_SUPPORTED: 'Canvas is not supported.'
}

export const CAMERA_DEFAULT_WIDTH = 1920
export const CAMERA_DEFAULT_HEIGHT = 1080
export const CAMERA_DEFAULT_FORMAT = 'image/jpeg'
export const CAMERA_DEFAULT_QUALITY = 1