import { combineReducers } from "redux"
import { mapReducer } from "./reducers"

//This is the funnel reducer
//A reducer is like a mini piece of the global state. If the state is an object, a reducer controls the contents of a key
//The funnel reducer combines all our reducers into one so that we can create a store

const funnelReducer = combineReducers({
    map: mapReducer,
})
export default funnelReducer
