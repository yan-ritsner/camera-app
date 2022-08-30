import {
  useState,
  useEffect,
  useRef,
} from 'react'

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

export const useGeolocation = () => {
  const [geoPosition, setGeoPosition] = useState()
  const [isGeolocating, setIsGeolocating] = useState(false)

  useEffect(() => {
    const { geolocation } = navigator
    if (!geolocation) return

    setIsGeolocating(true)
    geolocation.getCurrentPosition(
      (position) => {
        setGeoPosition(position)
        setIsGeolocating(false)
      },
      () => {
        setIsGeolocating(false)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: Infinity
      }
    )
  }, [setGeoPosition, setIsGeolocating])

  return [geoPosition, isGeolocating]
}