import { useCallback, useEffect, useRef } from 'react'

export function useKonamiCode(target: string, onMatch: () => void) {
  const bufferRef = useRef<string[]>([])
  const lastTimeRef = useRef(0)
  const onMatchRef = useRef(onMatch)
  onMatchRef.current = onMatch

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key.length !== 1 || !/[a-zA-Z]/.test(e.key)) return

    const now = Date.now()
    if (now - lastTimeRef.current > 2000) {
      bufferRef.current = []
    }
    lastTimeRef.current = now

    bufferRef.current.push(e.key.toLowerCase())
    if (bufferRef.current.length > target.length) {
      bufferRef.current.shift()
    }

    if (bufferRef.current.join('') === target) {
      bufferRef.current = []
      onMatchRef.current()
    }
  }, [target])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
