const defaultSettings = {
    colors: [
        "#ffcec5",
        "#ffad9f",
        "#ff8a75",
        "#ff5533",
        "#e2492d",
        "#be3d26",
        "#9a311f",
        "#782618",
        "#571206"
    ],
    formula: "Quantile"
}



const __settingsReducer = (state = defaultSettings, action) => {
    switch (action.type) {
        case "SET_MAP_SETTINGS_COLORS":
            return { colors: action.payload.colors, formula: state.formula }
        case "SET_MAP_SETTINGS_FORMULA":
            return { colors: state.colors, formula: action.payload.formula }
        default:
            return state
    }
}



export const mapReducer = (state = { param: "cases", selection: null, settings: defaultSettings, location: "USA States" }, action) => {
    if (["SET_MAP_SETTINGS_COLORS", "SET_MAP_SETTINGS_FORMULA"].indexOf(action.type) !== -1)
        return { selection: state.selection, param: state.param, settings: __settingsReducer(state.settings, action), location:state.location }
    else {
        switch (action.type) {
            case "SET_MAP_PARAM":
                return { selection: state.selection, param: action.payload.param, settings: state.settings, location:state.location  }
            case "SET_MAP_LOCATION":
                return { selection: state.selection, param: state.param, settings: state.settings, location:action.payload.location  }
            case "SET_MAP_SELECTION":
                return { selection: action.payload.selection, param: state.param, settings: state.settings, location:state.location  }
            default:
                return state
        }
    }

}
