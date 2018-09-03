import React, {Component} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';

import Home from './Home'
import Gathering from './Gathering'
import Buildings from './Buildings'
import Gyms from './Gyms'

class App extends Component {
    render() {
        return (<BrowserRouter basename={process.env.PUBLIC_URL}>
            <Switch>
                <Route exact path="/" component={Home}/>
                <Route path="/gathering" component={Gathering}/>
                <Route path="/buildings" component={Buildings}/>
                <Route path="/gyms" component={Gyms}/>
            </Switch>
        </BrowserRouter>);
    }
}

export default App;
