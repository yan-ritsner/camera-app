import React from 'react'

const CameraOverlay = ({
  width,
  height,
  shapeType,
  shapeRadius,
  shapeHMargin,
  shapeVMargin,
  shapeWidth,
  shapeHeight,
}) => {
  const circleR = shapeRadius
    ? shapeRadius
    : Math.max(Math.min(width, height) / 2 - shapeHMargin, 0)
  const circleX = '50%'
  let circleY = circleR + shapeVMargin
  const circleOverflow = circleY + circleR - height
  if (circleOverflow > 0) {
    circleY = circleY - circleOverflow - shapeHMargin
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
          <circle
            cx={circleX}
            cy={circleY}
            r={circleR}
          />
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
      <circle 
        cx={circleX}
        cy={circleY}
        r={circleR}
        strokeWidth="2"
        stroke="#fff"
        fill='none'
      />
    </svg>
  )
}


export default CameraOverlay
