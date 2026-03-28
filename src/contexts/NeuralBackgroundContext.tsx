import { createContext, useCallback, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react'

const STORAGE_KEY = 'masonsxu-neural-bg'

type TriggerSource = 'konami' | 'footer' | 'url' | 'close-button' | null

interface State {
  enabled: boolean
  triggerSource: TriggerSource
}

type Action =
  | { type: 'ACTIVATE'; source: Exclude<TriggerSource, null> }
  | { type: 'DEACTIVATE'; source: Exclude<TriggerSource, null> }

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'ACTIVATE':
      return { enabled: true, triggerSource: action.source }
    case 'DEACTIVATE':
      return { enabled: false, triggerSource: action.source }
  }
}

const NeuralBackgroundContext = createContext<{
  state: State
  toggle: (source: Exclude<TriggerSource, null>) => void
} | null>(null)

function readInitialState(): State {
  const params = new URLSearchParams(window.location.search)
  const urlParam = params.get('neural')
  if (urlParam === '1' || urlParam === 'true') {
    window.history.replaceState({}, '', window.location.pathname)
    localStorage.setItem(STORAGE_KEY, 'true')
    return { enabled: true, triggerSource: 'url' }
  }
  const stored = localStorage.getItem(STORAGE_KEY)
  return { enabled: stored === 'true', triggerSource: null }
}

export function NeuralBackgroundProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, readInitialState)
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true
      return
    }
    localStorage.setItem(STORAGE_KEY, String(state.enabled))
  }, [state.enabled])

  const toggle = useCallback((source: Exclude<TriggerSource, null>) => {
    dispatch({ type: state.enabled ? 'DEACTIVATE' : 'ACTIVATE', source })
  }, [state.enabled])

  return (
    <NeuralBackgroundContext.Provider value={{ state, toggle }}>
      {children}
    </NeuralBackgroundContext.Provider>
  )
}

export function useNeuralBackground() {
  const ctx = useContext(NeuralBackgroundContext)
  if (!ctx) throw new Error('useNeuralBackground must be used within NeuralBackgroundProvider')
  return ctx
}
