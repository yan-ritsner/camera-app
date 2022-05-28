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