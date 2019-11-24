import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { createHashHistory } from 'history'
import { routerMiddleware, routerActions } from 'connected-react-router'
import { createLogger } from 'redux-logger'
import { buildReducers } from '../reducers'
import * as counterActions from '../actions/counter'
import type { counterStateType } from '../reducers/types'

const history = createHashHistory()

const rootReducer = buildReducers(history)

export default { history }
