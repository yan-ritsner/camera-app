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