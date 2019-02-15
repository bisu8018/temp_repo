import React, { Component } from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import logobar from './logo_bar.svg';
import App from './App';
import Callback from './callback/callback';
import Auth from './auth/auth';
import history from './history';
import SignIn from './signin/SignIn'

import Header from "./header/Header";
import HeaderLinks from "./header/HeaderLinks";
import TopMenu from "./header/TopMenu";
import ContentView from "contents/ContentView";
import Author from "profile/Author";
import DrizzleApis from 'apis/DrizzleApis';
import ReactGA from 'react-ga';
import TrackingApis from 'apis/TrackingApis'

import { APP_PROPERTIES } from 'resources/app.properties';

if (process.env.NODE_ENV === 'production') {
  ReactGA.initialize('UA-129300994-1', {
    debug: false,
    gaOptions: {
      env: process.env.NODE_ENV
    }
  });

  console.log("google analytics on!!!", process.env)
} else {
  console.log("google analytics off!!!")
}
//console.log(window.location);
//console.log(APP_PROPERTIES.env, APP_PROPERTIES.domain());

const auth = new Auth();
//auth.login(true);

const handleAuthentication = ({location}) => {
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication();
  }
}

const handleLogout = ({location}) => {
  auth.logout();
}

//hubspot tracking
var _hsq = window._hsq = window._hsq || [];

class MainRoutes extends Component {
  state = { loading: true, drizzleState: null, drizzleApis: null};

  componentWillMount() {
    // subscribe to changes in the store
    // console.log("env", process.env);
    //auth.syncUser();
    const drizzleApis = new DrizzleApis((drizzleApis, drizzle, drizzleState) => {
      //console.log("MainRoutes", drizzleApis, drizzle, drizzleState);
      this.setState({drizzleApis: drizzleApis});
    });
    this.setState({drizzleApis: drizzleApis});
  }

  compomentWillUnmount() {

    this.unsubscribe();

  }

  componentDidMount() {
    this.sendPageView(history.location);
    history.listen(this.sendPageView);
  }

  sendPageView(location) {
    //hubspot tracking
    //console.log("Tracking sendPageView event", window.location.pathname + window.location.search)
    _hsq.push(['setPath', window.location.pathname + window.location.search]);
    _hsq.push(['trackPageView']);

    //GA tracking
    ReactGA.pageview(window.location.pathname + window.location.search);
  }

  render() {
    const { classes, ...rest } = this.props;
    //if (this.state.loading) return (<Callback {...this.props} message="Loading Drizzle...." />);

    return (
      <Router history={history}>
      <div>
        <Header
          brand="decompany.io"
          rightLinks={
            <HeaderLinks
              drizzleApis={this.state.drizzleApis} 
              auth={auth} />
          }
          fixed
          color="white"
          {...rest}
          {...this.props}
          auth={auth}
        />

        <TopMenu
          {...this.props}
          drizzleApis={this.state.drizzleApis} />


          <Switch>
            <Route exact path="/" render={(props) => <App drizzleApis={this.state.drizzleApis} drizzleState={this.state.drizzleState} auth={auth} {...props} />} />
            <Route path="/sign-in" render={(props) => <SignIn drizzleApis={this.state.drizzleApis} drizzleState={this.state.drizzleState} auth={auth} {...props} />} />
            <Route path="/latest" render={(props) => <App drizzleApis={this.state.drizzleApis} drizzleState={this.state.drizzleState} auth={auth} {...props} />} />
            <Route path="/popular" render={(props) => <App drizzleApis={this.state.drizzleApis} drizzleState={this.state.drizzleState} auth={auth} {...props} />} />
            <Route path="/featured" render={(props) => <App drizzleApis={this.state.drizzleApis} drizzleState={this.state.drizzleState} auth={auth} {...props} />} />
            <Route path="/tag/:tag" render={(props) => <App drizzleApis={this.state.drizzleApis} drizzleState={this.state.drizzleState} auth={auth} {...props} />} />
            <Route path="/content/view/:documentId" render={(props) => <ContentView drizzleApis={this.state.drizzleApis} drizzleState={this.state.drizzleState} auth={auth} {...props} />} />
            <Route path="/author/:accountId" render={(props) => <Author drizzleApis={this.state.drizzleApis} drizzleState={this.state.drizzleState} auth={auth} {...props} />} />
            <Route path="/curator/:accountId" render={(props) => <Author drizzleApis={this.state.drizzleApis} drizzleState={this.state.drizzleState} auth={auth} {...props} />} />
            <Route path="/callback" render={(props) => {
              handleAuthentication(props);
              return <Callback {...props} />
            }} />
          </Switch>

      </div>
      </Router>
    );
  }
}
export default MainRoutes;