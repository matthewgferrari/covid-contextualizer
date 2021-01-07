//These are actions for the redux store. Actions are like wrapping paper that act as a name tag...they carry events and provide an indentifier

//This is the action for changing the active tab

export const setMapSettingsColors = (colors) => {
    return {
        type:"SET_MAP_SETTINGS_COLORS",
        payload:{
            colors
        }
    }
}

export const setMapSettingsFormula = (formula) => {
    return {
        type:"SET_MAP_SETTINGS_FORMULA",
        payload:{
            formula
        }
    }
}

export const setMapSelection = (selection) => {
    return {
        type:"SET_MAP_SELECTION",
        payload:{
            selection
        }
    }
}

export const setMapLocation = (location) => {
    return {
        type:"SET_MAP_LOCATION",
        payload:{
            location
        }
    }
}

export const setMapParam = (param) => {
    return {
        type:"SET_MAP_PARAM",
        payload:{
            param
        }
    }
}
