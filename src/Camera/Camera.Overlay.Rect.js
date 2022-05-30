import React from 'react'


const CameraOverlayRect = ({
  width,
  height,
  shapeWidth,
  shapeHeight,
  shapeRatio,
  shapeHMargin,
  shapeVMargin,
  shapeBorder,
  shapeBorderRadius,
}) => {
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
  const borderProps = shapeBorder ? {
    strokeWidth: "2",
    stroke: "#fff",
    fill: 'none',
  } : {}

  return (
    <rect
      {...shapeProps}
      {...borderProps}
    />
  )
}

export default CameraOverlayRect