import { useState, memo, useEffect } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import "./index.css"
import { scaleQuantile, scaleQuantize } from "d3-scale";
import { useSelector, useDispatch } from "react-redux";
import { setMapSelection } from "../redux/actions"
import { FallBack } from "../Fallback"
import { ErrorBoundary } from "react-error-boundary"
import ClickAwayListener from "@material-ui/core/ClickAwayListener"
import { csv } from "d3-fetch"
import counties from "./counties.json"
import states from "./states.json"
import { Doughnut, Polar, Radar, Bar } from "react-chartjs-2"
import { draw } from "patternomaly"
import GaugeChart from './gauge'
import { Sparklines, SparklinesReferenceLine, SparklinesSpots, SparklinesCurve } from './spark/Sparklines';

var numeral = require('numeral');

const STATE_CONVERT = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'American Samoa': 'AS',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District of Columbia': 'DC',
    'Federated States Of Micronesia': 'FM',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Guam': 'GU',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Marshall Islands': 'MH',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Northern Mariana Islands': 'MP',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Palau': 'PW',
    'Pennsylvania': 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virgin Islands': 'VI',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
}

var LOCATION_DATA = {
    "USA Counties": {
        data: "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-counties.csv",
        map: counties
    },
    "USA States": {
        data: "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-states.csv",
        map: states
    }
}

export const Panel = () => {
    const selection = useSelector(state => state.map.selection)
    const dispatch = useDispatch()
    const [tab, setTab] = useState("COVID-19")


    const close = (e) => {
        try {
            if (e.target.ariaLabel !== "geo" && e.target.ariaLabel !== "panel" && !e.target.id.startsWith("geoState") && !e.target.id.startsWith("panel") && e.target.className !== "chartjs-render-monitor") {
                console.log(e)
                dispatch(setMapSelection(null))
            }
        } catch (error) {
            console.log(e)
            dispatch(setMapSelection(null))
        }
    }

    const getName = (cur) => {
        if (cur.county) {
            return `${cur.county}, ${STATE_CONVERT[cur.state]}`
        }
        else {
            return cur.state
        }
    }

    return (
        <>
            <div aria-label="panel" className="panelContainer" style={selection && selection.geo ? { transform: "translateX(0px)", transitionTimingFunction: "ease-out" } : { transform: "translateX(450px)", transitionTimingFunction: "ease-in" }}>
                <div aria-label="panel" style={{ position: "relative", width: "100%", height: "100%", backgroundColor: "rgb(18,18,18)" }}>
                    {selection && selection.geo &&
                        <ClickAwayListener onClickAway={(e) => close(e)}>
                            <div style={{ backgroundColor: "transparent", width: "100%", height: "100%", position: "absolute" }} />
                        </ClickAwayListener>
                    }
                    <ErrorBoundary FallbackComponent={FallBack}>

                        <div aria-label="panel" className="panelContentContainer">
                            {selection && selection.geo && selection.data && selection.geo.properties &&
                                <div aria-label="panel" style={{ height: "100vh", display: "flex", flexDirection: "column", width: "100%" }}>
                                    <h1 aria-label="panel" style={{ color: "rgb(228,228,228)", paddingLeft: "1rem", textAlign: "center", paddingTop: ".5rem" }}>{getName(selection.data)}</h1>
                                    <ErrorBoundary FallbackComponent={FallBack}>
                                        <ResultList data={selection} tab={tab} setTab={(t) => setTab(t)} />
                                    </ErrorBoundary>
                                </div>
                            }
                        </div>
                    </ErrorBoundary>
                </div>
            </div>
        </>

    )
}


const maskData = (data) => {
    return ({
        labels: Object.keys(data),
        datasets: [
            {
                backgroundColor: draw('diagonal', 'rgba(100, 100, 100, .15)', 'rgba(100, 100, 100, .65)', 10),

                data: Object.values(data),
                borderColor: "rgb(200,200,200)",
                pointBackgroundColor: [
                    'rgba(150, 0, 0, 0.5)',
                    'rgba(255, 165, 0, 0.5)',
                    'rgba(250, 250, 0, 0.5)',
                    'rgba(150, 255, 20, 0.5)',
                    'rgba(0, 150, 0, 0.5)',
                ],
                pointBorderColor: [
                    'rgba(150, 0, 0, 1)',
                    'rgba(255, 165, 0, 1)',
                    'rgba(250, 250, 0, 1)',
                    'rgba(150, 255, 20, 1)',
                    'rgba(0, 150, 0, 1)',
                ],
                borderWidth: 1,
                pointRadius: 3,
            },
        ],
    })
}

const educationData = (data) => {
    return ({
        labels: Object.keys(data),
        datasets: [
            {
                data: Object.values(data),
                backgroundColor: [
                    'rgba(150, 0, 0, 0.5)',
                    'rgba(255, 165, 0, 0.5)',
                    'rgba(250, 250, 0, 0.5)',
                    'rgba(150, 255, 20, 0.5)',
                    'rgba(0, 150, 0, 0.5)',
                ],
                borderColor: [
                    'rgba(150, 0, 0, 1)',
                    'rgba(255, 165, 0, 1)',
                    'rgba(250, 250, 0, 1)',
                    'rgba(150, 255, 20, 1)',
                    'rgba(0, 150, 0, 1)',
                ],
                borderWidth: 1,
            },
        ],
    })
}

const politicalData = (data) => {
    var rData = {
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        borderColor: 'rgba(255, 0, 0, 1)',
        data: data.Republican,
        label: "Republican"
    }
    var dData = {
        backgroundColor: 'rgba(75, 75, 255, .2)',
        borderColor: 'rgba(75, 75, 255, 1)',
        data: data.Democrat,
        label: "Democrat"
    }
    data = [rData, dData]

    data = data.sort((a, b) => b.data - a.data)

    return ({
        labels: data.map(item => item.label),
        datasets: [
            {
                data: data.map(item => item.data),
                backgroundColor: data.map(item => item.backgroundColor),
                borderColor: data.map(item => item.borderColor),
                borderWidth: ({dataIndex}) =>  dataIndex === 0 ? 3 : 1,
            },
        ]
    }
    )
}

const migrationData = (data) => {
    var extMig = [
        {
            label: data.domestic_migration > 0 ? 'domestic immigrants' : "domestic emigrants",
            data: Math.abs(data.domestic_migration),
            backgroundColor: data.domestic_migration > 0 ? 'rgba(10,210,10, 0.4)' : 'rgba(210, 10, 10, 0.4)',
            borderColor: data.domestic_migration > 0 ? 'rgba(10,210,10, 1)' : 'rgba(210, 10, 10, 1)'
        },
        {
            label: data.international_migration > 0 ? 'international immigrants' : "international emigrants",
            data: Math.abs(data.international_migration),
            backgroundColor: data.international_migration > 0 ? 'rgba(10,210,10, 0.4)' : 'rgba(210, 10, 10, 0.4)',
            borderColor: data.international_migration > 0 ? 'rgba(10,210,10, 1)' : 'rgba(210, 10, 10, 1)'
        }
    ]
    
    console.log(['births', 'deaths',...extMig.map(m => m.label), ])
    return ({
        labels: ['births', 'deaths',...extMig.map(m => m.label), ],
        datasets: [
            {
                label: '# of Votes',
                data: [Math.abs(data.births), Math.abs(data.deaths), ...extMig.map(m => m.data), ],
                backgroundColor: [
                    'rgba(10,210,10, 0.4)',
                    'rgba(210, 10, 10, 0.4)',
                    ...extMig.map(m => m.backgroundColor),
                ],
                borderColor: [
                    'rgba(10,210,10, 1)',
                    'rgba(210, 10, 10, 1)',
                    ...extMig.map(m => m.borderColor),
                ],
                borderWidth: 1,
            },
        ],
    })
}


const ResultList = ({ data, tab, setTab }) => {
    console.log(data)
    return (
        <>
            <Tabs tab={tab} setTab={(t) => setTab(t)} />
            <div aria-label="panel" className="panelTableContainer" >
                <div aria-label="panel" style={{ marginTop: "1rem" }}>
                    {tab === "COVID-19" && <CovidTab data={data} />}
                    {tab === "Population" && <PopulationTab data={data} />}
                    {tab === "Labor" && <LaborData data={data} />}

                </div>
            </div>
        </>
    )
}

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

const split = (arr, by) => {
    var ans = []
    var i = 0
    while (i < arr.length) {
        var temp = []
        for (var j = 0; j < by; j++) {
            temp.push(arr[i])
            i++;
        }

        ans.push(temp)
    }
    return ans
}

const LaborData = ({ data }) => {
    return (
        <>
            <div aria-label="panel" style={{ display: "flex", marginTop: "1rem" }}>
                <div aria-label="panel" style={{ width: "50%" }}>
                    <h4 aria-label="panel" style={{ textAlign: "center", color: "rgb(200,200,200)", marginBottom: ".2rem", fontSize: "1.1rem" }}>Median Income</h4>
                    <div aria-label="panel" style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
                        <GaugeChart id="panelGauge-chart"
                            animDelay={0}
                            nrOfLevels={20}
                            textColor="rgb(228,228,228)"
                            colors={["#ffffff", "#07a607"]}
                            animateDuration={1200}

                            percent={data.geo.properties.labor["Median Income"] / 95000}
                            formatTextValue={() => `$${numeral(data.geo.properties.labor["Median Income"]).format('0.00a')}`}
                        />
                    </div>
                </div>

                <div aria-label="panel" style={{ width: "50%" }}>
                    <h4 aria-label="panel" style={{ textAlign: "center", color: "rgb(200,200,200)", marginBottom: ".2rem", fontSize: "1.1rem" }}>Unemployment</h4>
                    <div aria-label="panel" style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
                        <GaugeChart id="panelGauge-chart"
                            nrOfLevels={20}
                            animDelay={0}
                            animateDuration={1200}
                            textColor="rgb(228,228,228)"
                            colors={["#ffffff", "#a60707"]}
                            percent={(data.geo.properties.labor["Unemployment Rate"] - 1) / (data.geo.properties.isState ? 5 : 8)}
                            formatTextValue={() => `${Math.round(data.geo.properties.labor["Unemployment Rate"] * 100) / 100}%`}
                        />
                    </div>
                </div>
            </div>
            <h4 aria-label="panel" style={{ textAlign: "center", color: "rgb(200,200,200)", marginBottom: ".5rem", marginTop: "1.75rem" }}>Education Levels</h4>
            <div aria-label="panel" style={{ height: "200px" }}>
                {data.geo.properties.education && <DoughnutChart data={educationData(data.geo.properties.education)} />}
            </div>
            <h4 aria-label="panel" style={{ textAlign: "center", color: "rgb(200,200,200)", marginBottom: ".5rem", marginTop: "1.75rem" }}>GDP Statistics</h4>
            <div aria-label="panel" style={{ color: "rgb(228,228,228)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem" }}>


                <div aria-label="panel" style={{ marginRight: "1rem", color: "rgb(200,200,200)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", }}>
                    <div style={{ width: "200px" }}>
                        <Sparklines aria-label="panel" data={[data.geo.properties.gdp.p1, data.geo.properties.gdp.p2, data.geo.properties.gdp.p3, data.geo.properties.gdp.p4, data.geo.properties.gdp.p5, data.geo.properties.gdp.p6]}>
                            <SparklinesCurve aria-label="panel" color="rgb(140,140,140)" style={{ fill: "transparent" }} />
                            <SparklinesReferenceLine aria-label="panel"  type="atZero" />
                            <SparklinesSpots aria-label="panel" style={{ fill: "rgb(200,200,200)" }} />
                        </Sparklines>
                    </div>
                    <div aria-label="panel" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "200px" }}>
                        <p  aria-label="panel"style={{ fontSize: ".6rem", transform: "translateY(-4px)", color: "rgb(140,140,140)" }}>2012</p>
                        <p aria-label="panel" style={{ fontSize: "1.2rem", transform: "translateY(-3px)" }}>% Change</p>
                        <p  aria-label="panel" style={{ fontSize: ".6rem", transform: "translateY(-4px)", color: "rgb(140,140,140)" }}>2019</p>
                    </div>
                </div>
                <div aria-label="panel" style={{ marginRight: "1rem", color: "rgb(200,200,200)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", }}>
                    <h3 aria-label="panel" style={{ lineHeight: "1rem" }}>{data.geo.properties.gdp.gdp > 999 ? numeral(data.geo.properties.gdp.gdp).format('0.0a') : data.geo.properties.gdp.gdp}</h3>
                    <p aria-label="panel" style={{ fontSize: "1.2rem" }}>GDP</p>
                </div>

            </div>
        </>
    )
}


const CovidTab = ({ data }) => {
    return (
        <>
            <h4 aria-label="panel" style={{ textAlign: "center", color: "rgb(200,200,200)", marginBottom: "1rem", }}>Statistics</h4>
            {
                split(STATS, 2).map((item, index) => {
                    if (data.data[item[0]] || data.data[item[1]]) {
                        return (<div key={index} aria-label="panel" style={{ color: "rgb(228,228,228)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem" }}>
                            {
                                item.map((stat, key) => {
                                    if (data.data[stat]) {
                                        return (
                                            <div key={key} aria-label="panel" style={{ marginRight: "1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", }}>
                                                <h3 aria-label="panel" style={{ lineHeight: "1rem" }}>{data.data[stat] > 999 ? numeral(data.data[stat]).format('0.0a') : data.data[stat]}</h3>
                                                <p aria-label="panel" style={{ fontSize: "1.2rem" }}>{STATS_CONVERT[stat]}</p>
                                            </div>
                                        )
                                    }

                                })
                            }
                        </div>)
                    }
                })
            }
            <h4 aria-label="panel" style={{ textAlign: "center", color: "rgb(200,200,200)", marginBottom: ".5rem" }}>Mask Usage</h4>
            <div aria-label="panel" style={{ height: "180px" }}>
                {data.geo.properties.masks && <RadarChart data={maskData(data.geo.properties.masks)} />}
            </div>
        </>
    )
}

const PopulationTab = ({ data }) => {
    return (
        <>
            <h4 aria-label="panel" style={{ textAlign: "center", color: "rgb(200,200,200)", marginBottom: ".2rem", marginTop: "1.75rem" }}>Statistics</h4>
            <div aria-label="panel" style={{ color: "rgb(228,228,228)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem" }}>
                <div aria-label="panel" style={{ marginRight: "1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", }}>
                    <h3 aria-label="panel" style={{ lineHeight: "1rem" }}>{data.geo.properties.population.population > 999 ? numeral(data.geo.properties.population.population).format('0.0a') : data.geo.properties.population.population}</h3>
                    <p aria-label="panel" style={{ fontSize: "1.2rem" }}>Population</p>
                </div>
                <div aria-label="panel" style={{ marginRight: "1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", }}>
                    <h3 aria-label="panel" style={{ lineHeight: "1rem" }}>{data.geo.properties.population.change > 999 ? numeral(data.geo.properties.population.change).format('0.0a') : data.geo.properties.population.change}</h3>
                    <p aria-label="panel" style={{ fontSize: "1.2rem" }}>Change</p>
                </div>
            </div>
            <h4 aria-label="panel" style={{ textAlign: "center", color: "rgb(200,200,200)", marginBottom: ".2rem", marginTop: "1.75rem" }}>Change in Population</h4>
            <div aria-label="panel" style={{ height: "200px", paddingLeft: "1rem", paddingRight: "1rem" }}>
                {data.geo.properties.political && <PolarChart data={migrationData(data.geo.properties.population)} />}
            </div>
            <h4 aria-label="panel" style={{ textAlign: "center", color: "rgb(200,200,200)", marginBottom: ".2rem", marginTop: "1.75rem" }}>Political Makeup</h4>
            <div aria-label="panel" style={{ height: "200px", paddingLeft: "1rem", paddingRight: "1rem" }}>
                {data.geo.properties.political && <BarChart data={politicalData(data.geo.properties.political)} />}
            </div>
        </>
    )
}

const TABS_LIST = ["COVID-19", "Population", "Labor"]
const Tabs = ({ tab, setTab }) => {

    const getStyle = (index) => {
        if (index === 0) {
            return ({
                width: "33%",
                borderBottomLeftRadius: ".3rem",
                borderTopLeftRadius: ".3rem",
            })
        }
        else if (index === TABS_LIST.length - 1) {
            return ({
                width: "33%",
                borderBottomRightRadius: ".3rem",
                borderTopRightRadius: ".3rem",
            })
        }
        else {
            return ({
                width: "33%",
            })
        }
    }

    const getClassName = (active, index) => {
        var c = "panelTab"
        if (active) {
            return c + " active"
        }
        else if (index !== 0 && TABS_LIST[index - 1] !== tab) {
            return c + " seperator"
        }
        else {
            return c
        }
    }

    return (
        <div aria-label="panel" style={{ color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(42,42,42,1)", marginLeft: ".75rem", marginRight: ".75rem", borderRadius: ".3rem", marginTop: "1rem", marginBottom: ".5rem" }}>
            {
                TABS_LIST.map((item, index) => {
                    return (<div aria-label="panel" onClick={() => setTab(item)} key={index} style={getStyle(index)} className={getClassName(item === tab, index)}>{item}</div>)
                })
            }

        </div>
    )
}


const PolarChart = ({ data }) => {
    return (
        <Polar data={data} aria-label="panel"
            options={{
                tooltips: {
                    callbacks: {
                        title: () => "",
                        label: function (tooltipItem, data) {
                            try {
                                return (data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] > 999 ? numeral(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]).format("0.00a") : data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]) + " " + data.labels[tooltipItem.index].toLowerCase()
                            }
                            catch (err) {
                                return "Tooltip error caught"
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                legend: { display: false },
                animation: { duration: 500, easing: 'easeOutCubic' },
                scale: {
                    ticks: {
                        backdropColor: "rgb(18,18,18)",
                        fontColor: "rgb(140,140,140)",

                    },
                    gridLines: {
                        color: "rgb(140,140,140)"
                    },
                    angleLines: {
                        color: "rgb(140,140,140)"
                    },
                    pointLabels: {
                        fontColor: "rgb(228,228,228)",
                        fontSize: 12
                    }
                }
            }}
        />
    )
}

const BarChart = ({ data }) => {
    return (
        <Bar aria-label="panel" data={data}
            options={{
                tooltips: {
                    callbacks: {
                        title: () => "",
                        label: function (tooltipItem, data) {
                            try {
                                return (data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] > 999 ? numeral(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]).format("0.00a") : data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] ) + " voted " + data.labels[tooltipItem.index]
                            }
                            catch (err) {
                                return "Tooltip error caught"
                            }
                        }
                    }
                },
                legend: { display: false },
                animation: { duration: 500, easing: 'easeOutCubic' },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            maxTicksLimit: 6,
                        }
                    }]
                }
            }}
        />
    )
}

const DoughnutChart = ({ data }) => {
    return (
        <Doughnut aria-label="panel" data={data}
            options={{
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            try {
                                return (data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] > 999 ? numeral(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]).format("0.00a") : data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]) + " have " + data.labels[tooltipItem.index]
                            }
                            catch (err) {
                                return "Tooltip error caught"
                            }
                        }
                    }
                },
                legend: { display: false },
                animation: { duration: 500, easing: 'easeOutCubic' },
            }}
        />
    )
}

const RadarChart = ({ data }) => {
    return (
        <Radar aria-label="panel" data={data}
            options={{
                tooltips: {
                    callbacks: {
                        title: () => "",
                        label: function (tooltipItem, data) {
                            try {
                                return Math.round(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] * 100) + "% " + data.labels[tooltipItem.index].toLowerCase() + " wears a mask"
                            }
                            catch (err) {
                                return "Tooltip error caught"
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                legend: { display: false },
                animation: { duration: 500, easing: 'easeOutCubic' },
                scale: {
                    ticks: {
                        backdropColor: "rgb(18,18,18)",
                        fontColor: "rgb(140,140,140)",
                        callback: (point) => ((Math.round(point * 100)) + "%"),
                        stepSize: 0.2,

                    },
                    gridLines: {
                        color: "rgb(140,140,140)"
                    },
                    angleLines: {
                        color: "rgb(140,140,140)"
                    },
                    pointLabels: {
                        fontColor: "rgb(228,228,228)",
                        fontSize: 12
                    }
                }
            }}
        />
    )
}


const Map = ({ className, setTooltip }) => {

    const dispatch = useDispatch()
    const settings = useSelector(state => state.map.settings)
    const param = useSelector(state => state.map.param)
    const location = useSelector(state => state.map.location)

    const [data, setData] = useState([])

    useEffect(() => {
        getData()
    }, [location]);

    const getData = () => {
        if (typeof LOCATION_DATA[location].data === "string") {
            csv(LOCATION_DATA[location].data).then(counties => {
                setData(counties);
                LOCATION_DATA[location].data = counties
            });
        }
        else {
            setData(LOCATION_DATA[location].data);
        }
    }

    const handleClick = (geo) => {
        dispatch(setMapSelection(geo))
    }

    const colorScale = settings.formula === "Quantize" ? scaleQuantize().domain(data.map(d => d[param])).range(settings.colors) : scaleQuantile().domain(data.map(d => d[param])).range(settings.colors);

    const getName = (cur) => {
        if (cur.county) {
            return `${cur.county}, ${STATE_CONVERT[cur.state]}`
        }
        else {
            return cur.state
        }
    }

    return (
        <>

            <div className={className}>
                <div className="map-container">
                    <ErrorBoundary FallbackComponent={FallBack}>
                        <ComposableMap data-tip="" className="map-svg" id="svgMapBaseLayer" projection="geoAlbersUsa">
                            <Geographies aria-label="geo" geography={LOCATION_DATA[location].map} className="map-path">
                                {({ geographies }) =>
                                    geographies.map(geo => {
                                        const cur = data.find(s => s.fips === geo.id);
                                        //console.log(cur)
                                        return (
                                            <ErrorBoundary key={geo.rsmKey} FallbackComponent={FallBack}>

                                                <Geography
                                                    aria-label="geo"
                                                    geography={geo}
                                                    fill={cur ? colorScale(cur[param]) : "#EEE"}
                                                    onMouseEnter={() => setTooltip(cur ? (getName(cur) + ` - ${(cur[param] > 999 ? numeral(cur[param]).format('0.0a') : cur[param])}`) : "")}
                                                    onMouseLeave={() => setTooltip("")}
                                                    onClick={() => cur ? handleClick({ geo, data: cur }) : undefined}
                                                    style={
                                                        {
                                                            default: { border: "none", outline: "none" },
                                                            pressed: { border: "none", outline: "none", fill: "rgba(0,0,0,.8)", },
                                                            hover: { border: "none", outline: "none", stroke: "rgba(0,0,0,.8)", strokeWidth: "2px", cursor: "pointer" }
                                                        }
                                                    }
                                                />
                                            </ErrorBoundary>
                                        );
                                    })
                                }
                            </Geographies>
                        </ComposableMap>
                    </ErrorBoundary>
                </div>
            </div>
        </>
    )
}

export default memo(Map)


