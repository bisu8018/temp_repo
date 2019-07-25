import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import configureStore from "./redux/store/configureStore";
import "assets/css/custom.css";
import registerServiceWorker from "./config/registerServiceWorker";
import MainContainer from "./container/MainContainer";

export let store = configureStore(); // 스토어 생성

let rootElement = document.getElementById("root");

ReactDOM.render(
  <Provider store={store}>
    <MainContainer className="App"/>
  </Provider>,
  rootElement
);
registerServiceWorker();
