import { useState, useRef } from "react"
import Header from "../Header"
import "./index.css"
import ReactTooltip from "react-tooltip";
import MapInternals, { Panel } from "./Map"
import Button from '@material-ui/core/Button';
import { createMuiTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { useSnackbar } from "notistack"
import { useDispatch, useSelector } from "react-redux"
import { setMapSettingsFormula, setMapSettingsColors, setMapParam, setMapLocation } from "../redux/actions"
import SpeedDial from '@material-ui/lab/SpeedDial';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import Hamburger from './burger'
import Picker from "./picker/Chrome"
import Popover from "@material-ui/core/Popover"
import Animate from "react-pose"
import { motion } from "framer-motion"
import arrayMove from "array-move"
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import { ErrorBoundary } from "react-error-boundary"
import { FallBack } from "../Fallback"
import { Dropdown } from "carbon-components-react"

const { saveSvgAsPng } = require('save-svg-as-png')


const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#003366",
        },
        secondary: {
            main: "rgb(3,3,3)",
        },
    },
});

const AttackMap = () => {
    return (
        <>
            <ErrorBoundary FallbackComponent={FallBack}>

                <div className="map-body">
                    <ThemeProvider theme={theme}>
                        <ErrorBoundary FallbackComponent={FallBack}>
                            <Header />
                        </ErrorBoundary>
                        <ErrorBoundary FallbackComponent={FallBack}>
                            <AttackSearch />
                        </ErrorBoundary>
                        <ErrorBoundary FallbackComponent={FallBack}>
                            <Map className="map" />
                        </ErrorBoundary>
                        <ErrorBoundary FallbackComponent={FallBack}>
                            <SpeedDialButton />
                        </ErrorBoundary>
                        <ErrorBoundary FallbackComponent={FallBack}>
                            <Panel />
                        </ErrorBoundary>
                    </ThemeProvider>
                </div>
            </ErrorBoundary>
        </>
    )
}
export default AttackMap

const useStyles = makeStyles({
    paper: {
        borderRadius: "1rem",
        boxShadow: "0px 6px 4px -1px rgba(0,0,0,0.2), 0px 10px 8px 1px rgba(0,0,0,0.18), 0px 4px 10px 0px rgba(0,0,0,0.12), 0px 10px 20px 2px rgba(0,0,0,0.2)"
    },
    list: {
        margin: "0",
        padding: '0',
    }
});

const STATS = [
    'cases',
    'deaths',
    'probable_cases',
    'probable_deaths',
    'confirmed_cases',
    'confirmed_deaths',

];

const STATS_CONVERT = {
    'cases': "Cases",
    'deaths': "Deaths",
    'confirmed_cases': "Confirmed Cases",
    'confirmed_deaths': "Confirmed Deaths",
    'probable_cases': "Probable Cases",
    'probable_deaths': "Probable Deaths",
};

const LOCATIONS = ["USA States", "USA Counties"]
const AttackSearch = () => {
    const param = useSelector(state => state.map.param)
    const location = useSelector(state => state.map.location)
    const dispatch = useDispatch()
    return (
        <div className="actor-search-container">
            <ErrorBoundary FallbackComponent={FallBack}>
                <Dropdown
                    items={STATS}
                    id="joyrideStep1"
                    titleText="Statistic"
                    label="dropdown"
                    //helperText="Combobox helper text"
                    style={{ minWidth: "200px" }}
                    onChange={({ selectedItem }) => selectedItem ? dispatch(setMapParam(selectedItem)) : undefined}
                    itemToString={(item) => STATS_CONVERT[item]}
                    selectedItem={param}
                />
                <Dropdown
                    items={LOCATIONS}
                    id="joyrideStep2"
                    titleText="Map"
                    label="dropdown"
                    //helperText="Combobox helper text"
                    style={{ minWidth: "200px" }}
                    onChange={({ selectedItem }) => selectedItem ? dispatch(setMapLocation(selectedItem)) : undefined}
                    selectedItem={location}
                />
            </ErrorBoundary>
        </div >

    )
}



const Map = ({ className }) => {
    const [tooltip, setTooltip] = useState("")
    return (
        <>
            <ErrorBoundary FallbackComponent={FallBack}>
                <MapInternals className={className} setTooltip={(data) => setTooltip(data)} />
                <ReactTooltip>{tooltip}</ReactTooltip>
            </ErrorBoundary>
        </>
    )
}



const SpeedDialButton = () => {
    const [open, setOpen] = useState(false)
    const [activeModal, setActiveModal] = useState(null)

    return (
        <>
            <ErrorBoundary FallbackComponent={FallBack}>

                <SpeedDial
                    ariaLabel="speeddial"
                    className="speed-dial"
                    icon={<Hamburger toggled={open} rounded size={25} />}
                    onClose={(e, r) => {
                        if (r === "blur" || r === "toggle") setOpen(false)
                    }}
                    onOpen={(e, r) => {
                        if (r === "toggle") setOpen(true)
                    }}

                    open={open}
                >
                    <SpeedDialAction
                        icon={<ColorDropper />}
                        tooltipTitle="Colors"
                        onClick={() => setActiveModal("color")}
                    />
                    <SpeedDialAction
                        icon={<Calculator />}
                        tooltipTitle="Formula"
                        onClick={() => setActiveModal("formula")}
                    />
                    <SpeedDialAction
                        icon={<SaveIcon />}
                        tooltipTitle="Save"
                        onClick={() => setActiveModal("save")}
                    />
                    <SpeedDialAction
                        icon={<DataIcon />}
                        tooltipTitle="Data"
                        onClick={() => setActiveModal("data")}
                    />
                </SpeedDial>
                <Modal activeModal={activeModal} setActiveModal={(modal) => setActiveModal(modal)} />
            </ErrorBoundary>
        </>

    )
}




//Give modal control of the contents so we can save before we exit

const Modal = ({ activeModal, setActiveModal }) => {
    const getContent = () => {
        if (activeModal === "formula") {
            return <FormulaModalContent setActiveModal={(modal) => setActiveModal(modal)} activeModal={activeModal} />
        }
        else if (activeModal === "color") {
            return <ColorModalContent setActiveModal={(modal) => setActiveModal(modal)} activeModal={activeModal} />
        }
        else if (activeModal === "save") {
            return <SaveModalContent setActiveModal={(modal) => setActiveModal(modal)} activeModal={activeModal} />
        }
        else if (activeModal === "data") {
            return <DataModalContent setActiveModal={(modal) => setActiveModal(modal)} activeModal={activeModal} />
        }
        else {
            return <div style={{ width: "0" }} />
        }
    }
    return getContent()
}


const DataModalContent = ({ activeModal, setActiveModal }) => {
    return (
        <Dialog onClose={() => setActiveModal(null)} open={activeModal === "data"} maxWidth={false}>
            <DialogTitle style={{}}>Data Sources</DialogTitle>
            <div style={{ paddingBottom: "1rem", paddingTop: "0rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}><h5>Covid Data</h5><a rel="noreferrer" target="_blank" href="https://github.com/nytimes/covid-19-data">The New York Times</a>; Reports from state and local health agencies</div>
            <div style={{ padding: "1rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}><h5>Population Data</h5><a rel="noreferrer" target="_blank" href="https://www.bea.gov/data/gdp/gdp-county-metro-and-other-areas">Bureau of Economic Analysis</a>; GDP by County, Metro, and Other Areas</div>
            <div style={{ padding: "1rem", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}><h5>Labor Data</h5><a rel="noreferrer" target="_blank" href="https://www.bls.gov/data/">Bureau of Labor Statistics</a>; Labor Force Statistics</div>
            <div style={{ padding: "1rem", paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingBottom: "1.5rem" }}><h5>Population Data</h5><a rel="noreferrer" target="_blank" href="https://www.ers.usda.gov/data-products/county-level-data-sets/">US Department of Agriculture</a>; Population, Income, Education, and Poverty</div>
        </Dialog>
    )
}

const Shake = Animate.div({
    shake: {
        applyAtEnd: { x: 0 },
        applyAtStart: { x: -6 },
        x: 0,
        transition: {
            type: "spring",
            stiffness: 2000,
            damping: 10,
            duration: 2
        }
    }
});
const variants = {
    visible: i => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * .05,
        },
    }),
    hidden: {
        opacity: 0,
        y: 100
    },
}
const ColorModalContent = ({ setActiveModal, activeModal }) => {
    const __reduxColors = useSelector(state => state.map.settings.colors)
    const [colors, setColors] = useState(__reduxColors)
    const [shakeCountExit, setShakeCountExit] = useState(0)
    const [shakeCountAdd, setShakeCountAdd] = useState(0)
    const dispatch = useDispatch()
    const [activeSwatch, setActiveSwatch] = useState({ color: null, index: null, elt: null })
    const [dragSwatch, setDragSwatch] = useState(null)

    const stopAnimation = useRef(false)
    const { enqueueSnackbar } = useSnackbar();


    const addColor = () => {
        stopAnimation.current = true
        if (colors.length <= 15) {
            setColors(["#ffffff", ...colors])
        }
        else {
            setShakeCountAdd(shakeCountAdd + 1)
            enqueueSnackbar("You can not have more than 16 colors", { variant: 'error', preventDuplicate: true })
        }
    }

    const removeIndex = () => {
        stopAnimation.current = true
        if (colors.length >= 5) {
            setColors(chop(colors, activeSwatch.index))
            setActiveSwatch({ index: null, color: null, elt: null })
            return true
        }
        else {
            enqueueSnackbar("You cannot have less than 4 colors", { variant: 'error', preventDuplicate: true })
            return false
        }
    }

    const updateIndex = (c) => {
        stopAnimation.current = true
        var temp = [...colors]
        temp[activeSwatch.index] = c
        setColors(temp)
        setActiveSwatch({ index: null, color: null, elt: null })
    }

    const handleClose = () => {
        if (colors === __reduxColors) {
            setActiveModal(null)
        }
        else {
            setShakeCountExit(shakeCountExit + 1)
        }
    }

    const handleSave = () => {
        dispatch(setMapSettingsColors(colors))
        setActiveModal(null)
    }

    const onSortEnd = ({ oldIndex, newIndex }) => {
        setDragSwatch(null)
        setColors(() => arrayMove(colors, oldIndex, newIndex));
    }
    return (
        <>
            <ErrorBoundary FallbackComponent={FallBack}>

                <Dialog onClose={() => handleClose()} open={activeModal === "color"} maxWidth={false}>
                    <div style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
                        <DialogTitle style={{ paddingLeft: ".5rem", paddingRight: ".5rem" }}>Data Scaling Map Colors </DialogTitle>
                        <div className={dragSwatch ? "colorSwatchContainerWrapper dragging" : "colorSwatchContainerWrapper"} style={activeSwatch.color ? { overflow: "hidden" } : undefined}>
                            <ErrorBoundary FallbackComponent={FallBack}>

                                <SortableContainer onSortEnd={(i) => onSortEnd(i)} onSortStart={(e) => setDragSwatch(e.index)} distance={5} axis="x" lockAxis="x" lockToContainerEdges={true} colors={colors}>
                                    {
                                        colors.map((hex, index) => {
                                            return (
                                                <SortableItem key={index} dragSwatch={dragSwatch} stopAnimation={stopAnimation.current} hex={hex} index={index} itemIndex={index} colors={colors} activeSwatch={activeSwatch} setActiveSwatch={(s) => setActiveSwatch(s)} />
                                            )
                                        })
                                    }
                                </SortableContainer>
                            </ErrorBoundary>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", overflowY: "hidden", paddingLeft: ".5rem", paddingRight: ".5rem" }}>
                            <Typography component="div" variant="subtitle2">Lowest value on map</Typography>
                            <motion.div
                                custom={colors.length}
                                animate="visible"
                                initial="hidden"
                                variants={variants}
                            ><Typography component="div" variant="subtitle2">Highest value on map</Typography></motion.div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", margin: "1rem" }}>
                            <Shake pose={["shake"]} poseKey={shakeCountAdd}>
                                <Button color="primary" variant="contained" onClick={() => addColor()}>Add Color</Button>
                            </Shake>
                            <Shake pose={["shake"]} poseKey={shakeCountExit} style={{ display: "flex", justifyContent: "center" }}>
                                <Button color="primary" variant="contained" onClick={() => setActiveModal(null)} style={{ marginLeft: ".5rem" }}>Cancel</Button>
                                <Button color="primary" variant="contained" onClick={() => handleSave()} style={{ marginLeft: ".5rem" }}>Save</Button>
                            </Shake>
                        </div>
                        <ErrorBoundary FallbackComponent={FallBack}>

                            <Popover
                                anchorEl={activeSwatch.elt}
                                open={Boolean(activeSwatch.elt)}
                                onClose={() => setActiveSwatch({ index: null, color: null, elt: null })}
                                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                transitionDuration={0}
                                elevation={4}
                            // classes={{ paper: classes.paper, list: classes.list }}
                            >
                                <PickerWrapper defaultColor={activeSwatch.color} remove={() => removeIndex()} update={(c) => updateIndex(c)} />
                            </Popover>
                        </ErrorBoundary>
                    </div>
                </Dialog>
            </ErrorBoundary>
        </>
    )
}

const SortableContainer = sortableContainer(({ children }) => {
    return <div className="colorSwatchContainer">{children}</div>
});

const SortableItem = sortableElement(props => <ColorSwatch {...props} />);

const ColorSwatch = ({ itemIndex: index, hex, colors, activeSwatch, setActiveSwatch, stopAnimation, dragSwatch }) => {

    return (
        <ErrorBoundary FallbackComponent={FallBack}>
            <div className="colorSwatchWrapper">
                <motion.div
                    custom={stopAnimation ? 0 : index}
                    animate="visible"
                    initial={stopAnimation ? undefined : "hidden"}
                    variants={variants}
                    className="colorSwatchCardContainer" onClick={(e) => setActiveSwatch({ color: colors[index], index, elt: e.currentTarget })}>
                    <div className={dragSwatch ? "colorSwatchCard" : "colorSwatchCard hoverable"} style={(index === activeSwatch.index) ? { border: `2px ${invertColor(hex)} solid`, backgroundColor: hex, height: "90px", borderTopLeftRadius: ".3rem", borderTopRightRadius: ".3rem" } : { backgroundColor: hex, border: `2px ${hex} solid`, }} >
                        <Typography variant="button" component="span" style={{ color: invertColor(hex, true), fontSize: "10px" }}>{hex}</Typography>
                    </div>
                </motion.div>
            </div>
        </ErrorBoundary>
    )
}

const PickerWrapper = ({ defaultColor, remove, update }) => {
    const [color, setColor] = useState(defaultColor)
    const [shakeCountRemove, setShakeCountRemove] = useState(0)
    return (
        <ErrorBoundary FallbackComponent={FallBack}>
            <Picker disableAlpha color={color} onChange={({ hex }) => setColor(hex)} />
            <div style={{ display: 'flex', justifyContent: "center", alignItems: "center", marginBottom: "6px" }}>
                <Shake pose={["shake"]} poseKey={shakeCountRemove}>
                    <Button variant="contained" style={{ marginRight: ".5rem" }} onClick={() => {
                        if (remove() === false)
                            setShakeCountRemove(shakeCountRemove + 1)
                    }}>Remove</Button>
                </Shake>
                <Button variant="contained" style={{ marginLeft: ".5rem", paddingLeft: "26.65px", paddingRight: "26.65px" }} onClick={() => update(color)}>Save</Button>
            </div>
        </ErrorBoundary>
    )
}


const SaveModalContent = ({ setActiveModal, activeModal }) => {

    const saveSVG = () => {
        var filename = "map.svg"
        var data = document.getElementById("svgMapBaseLayer").outerHTML
        data = data.slice(0, 4) + ' xmlns="http://www.w3.org/2000/svg"' + data.slice(4);
        var blob = new Blob([data]);
        if (window.navigator.msSaveOrOpenBlob)  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
            window.navigator.msSaveBlob(blob, filename);
        else {
            var a = window.document.createElement("a");
            a.href = window.URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
            document.body.removeChild(a);
        }
    }

    const savePNG = () => {
        saveSvgAsPng(document.getElementById("svgMapBaseLayer"), "map.png");
    }

    return (
        <>
            <ErrorBoundary FallbackComponent={FallBack}>

                <Dialog onClose={() => setActiveModal(null)} open={activeModal === "save"} maxWidth={false}>

                    <DialogTitle >Save Map</DialogTitle>
                    <List>
                        <ListItem button onClick={() => savePNG()}>
                            <ListItemText primary={"Download as PNG"} secondary={"Save the total map lay as a raster image"} />
                            {/* <Trigger>Download as PNG</Trigger> */}
                        </ListItem>
                        <ListItem button onClick={() => saveSVG()}>
                            <ListItemText primary={"Download as SVG"} secondary={"Save the total map lay as a vector graphic"} />
                        </ListItem>
                    </List>
                </Dialog>
            </ErrorBoundary>
        </>
    )
}


const FormulaModalContent = ({ setActiveModal, activeModal }) => {
    const formula = useSelector(state => state.map.settings.formula)
    const dispatch = useDispatch()
    const handleClick = (f) => {

        if (f !== formula) {
            dispatch(setMapSettingsFormula(f))
        }

        setActiveModal(null)
    }
    return (
        <>
            <ErrorBoundary FallbackComponent={FallBack}>

                <Dialog onClose={() => setActiveModal(null)} open={activeModal === "formula"} maxWidth={false}>

                    <DialogTitle >Data Scaling Formula</DialogTitle>
                    <List>
                        <ListItem button selected={formula === "Quantile"} onClick={() => handleClick("Quantile")}>
                            <ListItemText primary={"Quantile"} secondary={"Rolling scale with a continous range"} />
                        </ListItem>
                        <ListItem button selected={formula === "Quantize"} onClick={() => handleClick("Quantize")}>
                            <ListItemText primary={"Quantize"} secondary={"Linear scale variant with a discrete range"} />
                        </ListItem>
                    </List>
                </Dialog>
            </ErrorBoundary>
        </>
    )
}


const DataIcon = () => {
    return (
        <svg
            height={20}
            viewBox="0 0 24 24"
            width={20}
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
        >
            <path d="M12 6C10.772 6 0 5.916 0 3s10.772-3 12-3 12 .084 12 3-10.772 3-12 3zM1.588 3C2.32 3.568 5.833 4.5 12 4.5s9.68-.932 10.412-1.5C21.68 2.432 18.167 1.5 12 1.5S2.32 2.432 1.588 3zm20.939.116h.01zM12 12c-1.228 0-12-.084-12-3a.75.75 0 011.495-.086C1.957 9.467 5.507 10.5 12 10.5s10.043-1.033 10.505-1.586A.75.75 0 0124 9c0 2.916-10.772 3-12 3zm10.5-3.001c0 .001 0 .001 0 0zm-21 0c0 .001 0 .001 0 0zM12 18c-1.228 0-12-.084-12-3a.75.75 0 011.495-.086C1.957 15.467 5.507 16.5 12 16.5s10.043-1.033 10.505-1.586A.75.75 0 0124 15c0 2.916-10.772 3-12 3zm10.5-3.001c0 .001 0 .001 0 0zm-21 0c0 .001 0 .001 0 0z" />
            <path d="M12 24c-1.228 0-12-.084-12-3V3a.75.75 0 011.5 0v17.919c.481.556 4.03 1.581 10.5 1.581s10.019-1.025 10.5-1.581V3A.75.75 0 0124 3v18c0 2.916-10.772 3-12 3z" />
            <circle cx={5} cy={14} r={1} />
            <circle cx={5} cy={8} r={1} />
            <circle cx={5} cy={20} r={1} />
        </svg>
    )
}

const chop = (arr, index) => {
    var ans = []
    for (var i = 0; i < arr.length; i++) {
        if (i !== index) {
            ans.push(arr[i])
        }
    }
    return ans
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16)
    var g = parseInt(hex.slice(2, 4), 16)
    var b = parseInt(hex.slice(4, 6), 16)

    if (bw) {
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';
    }

    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);

    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function ColorDropper() {
    return (
        <svg height={20} viewBox="0 0 24 24" width={20} fill="currentColor">
            <path d="M23.1.9C21.9-.3 20-.3 18.9.9l-2.4 2.4-2.1-2.1-4.2 4.2 2.1 2.1-9.1 9.1L1 20.2c-.5 1.1-1.3 3.1-.8 3.6.6.6 2.7-.3 3.6-.8l3.5-2.1 9.1-9.1 2.1 2.1 4.2-4.2-2.1-2.1L23 5.2c1.3-1.3 1.3-3.2.1-4.3zm-8.7 11.6L13 11.1l-.7.7 1.4 1.4-1.4 1.4-1.4-1.4-.7.7 1.4 1.4-1.4 1.4-1.4-1.4-.8.7 1.4 1.4-1.5 1.5-1.4-1.4-.7.7 1.4 1.4-.6.6-3.5 2.1c-.7.3-1.8.9-2.1.7-.3-.3.4-1.4.7-2.1l2.1-3.5L13 8.2l2.8 2.8-1.4 1.5zm7.3-8.8l-3.8 3.8L20 9.6 18.6 11 13 5.4 14.4 4l2.1 2.1 3.8-3.8c.4-.4 1-.4 1.4 0s.4 1 0 1.4z" />
        </svg>
    )
}

function Calculator() {
    return (
        <svg width="1.25rem" height="1.25rem" viewBox="0 0 16 16" className="bi bi-calculator" fill="currentColor" >
            <path fillRule="evenodd" d="M12 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z" />
            <path d="M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm0 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-4z" />
        </svg>
    )
}

function SaveIcon() {
    return (
        <svg height={20} viewBox="0 0 18 18" width={20} fill="currentColor">
            <path
                d="M14 0H2C.9 0 0 .9 0 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4l-4-4zM9 16c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm3-10H2V2h10v4z"
                fillRule="evenodd"
            />
        </svg>
    )
}
function HdIcon() {
    return (
        <svg width="1.25rem" height="1.25rem" viewBox="0 0 16 16" className="bi bi-badge-hd" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M14 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2z" />
            <path d="M7.396 11V5.001H6.209v2.44H3.687V5H2.5v6h1.187V8.43h2.522V11h1.187zM8.5 5.001V11h2.188c1.811 0 2.685-1.107 2.685-3.015 0-1.894-.86-2.984-2.684-2.984H8.5zm1.187.967h.843c1.112 0 1.622.686 1.622 2.04 0 1.353-.505 2.02-1.622 2.02h-.843v-4.06z" />
        </svg>

    )
}

function ClearIcon() {
    return (
        <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-x" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
        </svg>
    )
}


