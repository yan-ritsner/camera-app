import React from 'react'
import { CAMERA_OVERLAY_SHAPE } from './Camera.constants'

const CameraOverlay = ({
  width,
  height,
  shapeType,
  shapeProps,
}) => {
  const borderProps = {
    strokeWidth: "2",
    stroke: "#fff",
    fill: 'none',
  }
  let shapeMask
  let shapeBorder
  switch (shapeType) {
    case CAMERA_OVERLAY_SHAPE.CIRCLE: {
      shapeMask = (
        <circle
          {...shapeProps}
        />
      )
      shapeBorder = (
        <circle
          {...shapeProps}
          {...borderProps}
        />
      )
      break;
    }
    case CAMERA_OVERLAY_SHAPE.RECT: {
      shapeMask = (
        <rect
          {...shapeProps}
        />
      )
      shapeBorder = (
        <rect
          {...shapeProps}
          {...borderProps}
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
