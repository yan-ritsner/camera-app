import React from 'react'

const CameraOverlayCircle = ({
  width,
  height,
  shapeRadius,
  shapeHMargin,
  shapeVMargin,
  shapeBorder,
}) => {
  const circleR = shapeRadius
    ? shapeRadius
    : Math.max(Math.min(width, height) / 2 - shapeHMargin, 0)
  let circleX
  let circleY

  if (height > width) {
    circleX = '50%'
    circleY = circleR + shapeVMargin
  } else {
    circleX = circleR + shapeVMargin
    circleY = '50%'
  }

  const shapeProps = {
    cx: circleX,
    cy: circleY,
    r: circleR,
  }
  const borderProps = shapeBorder ? {
    strokeWidth: "2",
    stroke: "#fff",
    fill: 'none',
  } : {}

  return (
    <circle
      {...shapeProps}
      {...borderProps}
    />
  )
}

export default CameraOverlayCircle