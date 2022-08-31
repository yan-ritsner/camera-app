import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import _isFunction from 'lodash/isFunction'

export const useElementSize = (elementRef) => {
  const [size, setSize] = useState({
    width: 0,
    height: 0
  })

  const observerRef = useRef(
    new ResizeObserver(entries => {

      const [entry] = entries
      const {
        width = 0,
        height = 0,
      } = entry.contentRect

      setSize({
        width,
        height,
      })
    })
  )

  useEffect(() => {
    const observer = observerRef.current
    const element = elementRef.current
    if (element) {
      observer.observe(element)
    }
    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, observerRef])

  return size
}

export const useGeolocation = (isCanceled) => {
  const [geoPosition, setGeoPosition] = useState()
  const [isGeolocating, setIsGeolocating] = useState(false)

  const onGeoPosition = useCallback((position) => {
    if (_isFunction(isCanceled) && isCanceled()) {
      return
    }
    setGeoPosition(position)
    setIsGeolocating(false)
  }, [isCanceled])

  useEffect(() => {
    const { geolocation } = navigator
    if (!geolocation) return

    setIsGeolocating(true)
    geolocation.getCurrentPosition(
      (position) => onGeoPosition(position),
      () => onGeoPosition(),
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: Infinity
      }
    )
  }, [onGeoPosition])

  return [geoPosition, isGeolocating]
}