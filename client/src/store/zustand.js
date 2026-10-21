import { useSyncExternalStore } from 'react'

/**
 * Lightweight, zero-dependency implementation of Zustand's create.
 * Backed natively by React 18/19's useSyncExternalStore.
 */
export function create(initializer) {
  let state
  const listeners = new Set()

  const setState = (partial, replace) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial
    if (!Object.is(nextState, state)) {
      state = replace || typeof nextState !== 'object' || nextState === null
        ? nextState
        : Object.assign({}, state, nextState)
      listeners.forEach((listener) => {
        try {
          listener()
        } catch (e) {
          console.error(e)
        }
      })
    }
  }

  const getState = () => state
  const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const api = { setState, getState, subscribe }
  state = initializer(setState, getState, api)

  const useBoundStore = (selector = (s) => s) => {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state)
    )
  }

  Object.assign(useBoundStore, api)
  return useBoundStore
}

export default create
