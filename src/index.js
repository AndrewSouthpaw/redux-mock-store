import { applyMiddleware } from 'redux'
import isPlainObject from 'lodash.isplainobject'

const isFunction = arg => typeof arg === 'function'

export default function configureStore (middlewares = []) {
  return function mockStore (state = {}) {
    function mockStoreWithoutMiddleware () {
      let actions = []
      let listeners = []
      let reducer = state => state

      const self = {
        getState () {
          return isFunction(state) ? state(actions) : state
        },

        getActions () {
          return actions
        },

        dispatch (action) {
          if (!isPlainObject(action)) {
            throw new Error(
              'Actions must be plain objects. ' +
              'Use custom middleware for async actions.'
            )
          }

          if (typeof action.type === 'undefined') {
            throw new Error(
              'Actions may not have an undefined "type" property. ' +
              'Have you misspelled a constant? ' +
              'Action: ' +
              JSON.stringify(action)
            )
          }

          actions.push(action)
          state = reducer(state, action)

          for (let i = 0; i < listeners.length; i++) {
            listeners[i](action)
          }

          return action
        },

        clearActions () {
          actions = []
        },

        subscribe (cb) {
          if (isFunction(cb)) {
            listeners.push(cb)
          }

          return () => {
            const index = listeners.indexOf(cb)

            if (index < 0) {
              return
            }
            listeners.splice(index, 1)
          }
        },

        replaceReducer (nextReducer) {
          if (!isFunction(nextReducer)) {
            throw new Error('Expected the nextReducer to be a function.')
          }

          reducer = nextReducer
        }
      }

      return self
    }

    const mockStoreWithMiddleware = applyMiddleware(
      ...middlewares
    )(mockStoreWithoutMiddleware)

    return mockStoreWithMiddleware()
  }
}
