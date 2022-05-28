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
  shapeBorderRadius,
  shapeHMargin,
  shapeVMargin,
}) => {

  let shapeMask
  let shapeBorder
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
      const shapeProps = {
        cx: circleX,
        cy: circleY,
        r: circleR,
      }
      shapeMask = (
        <circle
          {...shapeProps}
        />
      )
      shapeBorder = (
        <circle
          {...shapeProps}
          strokeWidth="2"
          stroke="#fff"
          fill='none'
        />
      )
      break;
    }
    case CAMERA_OVERLAY_SHAPE.RECT: {
      let rectWidth
      let rectHeight
      let rectX
      let rectY

      if (height > width) {
        rectWidth = shapeWidth
          ? shapeWidth
          : Math.max(width - (shapeHMargin * 2), 0)
        rectHeight = shapeHeight
          ? shapeHeight
          : rectWidth / shapeRatio
        rectX = shapeHMargin
        rectY = shapeVMargin
      } else {
        rectHeight = shapeHeight
          ? shapeHeight
          : Math.max(height - (shapeHMargin * 2), 0)
        rectWidth = shapeWidth
          ? shapeWidth
          : rectHeight * shapeRatio
        rectX = shapeVMargin
        rectY = shapeHMargin
      }

      const shapeProps = {
        width: rectWidth,
        height: rectHeight,
        x: rectX,
        y: rectY,
        rx: shapeBorderRadius
      }
      shapeMask = (
        <rect
          {...shapeProps}
        />
      )
      shapeBorder = (
        <rect
          {...shapeProps}
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
