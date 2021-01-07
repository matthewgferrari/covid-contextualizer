import 'react-app-polyfill/ie11';
import "react-app-polyfill/stable"
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { createStore } from "redux"
import { Provider } from "react-redux"
import funnelReducer from "./redux"
import { SnackbarProvider } from "notistack"
import { ErrorBoundary } from "react-error-boundary"
import { FallBack } from "./Fallback"
import { BrowserRouter } from "react-router-dom"
//Create a store from the funnel reducer

const store = createStore(funnelReducer, /*loadState(),*/ window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


//Render the app and wrap in redux store
ReactDOM.render(
    <ErrorBoundary FallbackComponent={FallBack}>
        <BrowserRouter>
            <Provider store={store}>
                <React.StrictMode>
                    <NotificationWrapper >
                        <ErrorBoundary FallbackComponent={FallBack}>
                            <App />
                        </ErrorBoundary>
                    </NotificationWrapper >
                </React.StrictMode>
            </Provider>
        </BrowserRouter>
    </ErrorBoundary>,
    document.getElementById('root')
);


function NotificationWrapper(props) {
    const notistackRef = React.createRef();
    const onClickDismiss = key => () => {
        notistackRef.current.closeSnackbar(key);
    }
    return (
        <SnackbarProvider maxSnack={3}
            iconVariant={{ error: <span className = "alertIcon"><AlertIcon /></span> }}
            ref={notistackRef}
            //Add dismiss button to alerts
            action={(key) => (<b style={{ color: "black", cursor: "pointer", margin: "0" }} onClick={onClickDismiss(key)}>Dismiss</b>)}>
            {props.children}
        </SnackbarProvider>
    );
}

function AlertIcon() {
    return (<svg width="1.5rem" height="1.5rem" viewBox="0 0 16 16" className="bi bi-exclamation-triangle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M7.938 2.016a.146.146 0 0 0-.054.057L1.027 13.74a.176.176 0 0 0-.002.183c.016.03.037.05.054.06.015.01.034.017.066.017h13.713a.12.12 0 0 0 .066-.017.163.163 0 0 0 .055-.06.176.176 0 0 0-.003-.183L8.12 2.073a.146.146 0 0 0-.054-.057A.13.13 0 0 0 8.002 2a.13.13 0 0 0-.064.016zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z" />
        <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
    </svg>)
}