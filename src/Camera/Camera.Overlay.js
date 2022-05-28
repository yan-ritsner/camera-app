import React from 'react'
import { CAMERA_OVERLAY_SHAPE } from './Camera.constants'

const CameraOverlay = ({
  width,
  height,
  shapeType,
  shapeRadius,
  shapeWidth,
  shapeHeight,
  shapeRatio,
  shapeHMargin,
  shapeVMargin,
}) => {

  let shapeMask = null
  let shapeBorder = null
  switch (shapeType) {
    case CAMERA_OVERLAY_SHAPE.CIRCLE: {
      const circleR = shapeRadius
        ? shapeRadius
        : Math.max(Math.min(width, height) / 2 - shapeHMargin, 0)
      const circleX = '50%'
      let circleY = circleR + shapeVMargin
      const circleOverflow = circleY + circleR - height
      if (circleOverflow > 0) {
        circleY = circleY - circleOverflow - shapeHMargin
      }
      shapeMask = (
        <circle
          cx={circleX}
          cy={circleY}
          r={circleR}
        />)
      shapeBorder = (
        <circle
          cx={circleX}
          cy={circleY}
          r={circleR}
          strokeWidth="2"
          stroke="#fff"
          fill='none'
        />
      )
      break;
    }
    default: {
      shapeMask = null
      shapeBorder = null
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
