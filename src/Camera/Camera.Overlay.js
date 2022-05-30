import React from 'react'
import { CAMERA_OVERLAY_SHAPE } from './Camera.constants'
import CameraOverlayCircle from './Camera.Overlay.Circle'
import CameraOverlayRect from './Camera.Overlay.Rect'


const CameraOverlay = ({
  width,
  height,
  shapeType,
  shapeRadius,
  shapeWidth,
  shapeHeight,
  shapeRatio,
  shapeBorderRadius,
  shapeHMargin,
  shapeVMargin,
}) => {
  let shapeMask
  let shapeBorder
  switch (shapeType) {
    case CAMERA_OVERLAY_SHAPE.CIRCLE: {
      const shapeProps = {
        width,
        height,
        shapeRadius,
        shapeHMargin,
        shapeVMargin,
      }
      shapeMask = (
        <CameraOverlayCircle
          {...shapeProps}
        />
      )
      shapeBorder = (
        <CameraOverlayCircle
          {...shapeProps}
          shapeBorder
        />
      )
      break;
    }
    case CAMERA_OVERLAY_SHAPE.RECT: {
      const shapeProps = {
        width,
        height,
        shapeWidth,
        shapeHeight,
        shapeRatio,
        shapeHMargin,
        shapeVMargin,
        shapeBorderRadius,
      }
      shapeMask = (
        <CameraOverlayRect
          {...shapeProps}
        />
      )
      shapeBorder = (
        <CameraOverlayRect
          {...shapeProps}
          shapeBorder
        />
      )
      break;
    }
    default: {
      return null
    }
  }

  return (
    <svg
      className='camera-overlay'
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <mask
          id="mask"
          x="0"
          y="0"
          width={'100%'}
          height={'100%'}
        >
          <rect
            x="0"
            y="0"
            width={'100%'}
            height={'100%'}
            fill="#fff"
          />
          {shapeMask}
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width={'100%'}
        height={'100%'}
        mask="url(#mask)"
        fillOpacity="0.4"
      />
      {shapeBorder}
    </svg>
  )
}


export default CameraOverlay
