import React, {Component} from 'react'
import AndroidHome from './AndroidHome'
import UrlInput from './UrlInput'
import ChooseDevices from './ChooseDevices'
import DownloadRepo from './DownloadRepo'
import BuildRepo from './BuildRepo'
import LaunchRepo from './LaunchRepo'
import "whatwg-fetch"

import {Grid, Row, Col} from "react-bootstrap";

const CONDITION_GET_ANDROID_HOME = 0;
const CONDITION_SET_REPO_URL = 1;
const CONDITION_CHOOSE_DEVICES = 2;
const CONDITION_DOWNLOAD_REPO = 3;
const CONDITION_BUILD_REPO = 4;
const CONDITION_LAUNCH_APP = 5;



const BASE_URL = "http://localhost:5555";

class App extends Component{
    constructor(props) {
        super(props);

        this.state = {condition: CONDITION_GET_ANDROID_HOME, url: '', deviceId: ''};
        
    }
    
    renderUrlInput = () => {
        this.setState({condition: CONDITION_SET_REPO_URL})
    };
    
    restartApp = () => {
        this.setState({condition: CONDITION_GET_ANDROID_HOME});
    };
    
    setUrlThenMoveToDevices = (url) => {
        this.setState({url: url, condition: CONDITION_CHOOSE_DEVICES});
    };
    
    setDeviceThenStartDownloading = (deviceId) => {
        this.setState({deviceId: deviceId, condition: CONDITION_DOWNLOAD_REPO});
    };
    
    startBuildingRepo = () => {
        this.setState({condition: CONDITION_BUILD_REPO});
    };
    
    startLaunchingApp = () => {
        this.setState({condition: CONDITION_LAUNCH_APP});
    };
    
    
    render() {
        let template = <h1>Condition does not exist</h1>;
        
        if (this.state.condition === CONDITION_GET_ANDROID_HOME)
            template = <AndroidHome baseUrl={BASE_URL} renderUrlInput={this.renderUrlInput}/>;
        else if (this.state.condition === CONDITION_SET_REPO_URL)
            template = <UrlInput setUrlThenMoveToDevices={this.setUrlThenMoveToDevices}/>;
        else if (this.state.condition === CONDITION_CHOOSE_DEVICES)
            template = <ChooseDevices baseUrl={BASE_URL} setDeviceThenStartDownloading={this.setDeviceThenStartDownloading} />;
        else if (this.state.condition === CONDITION_DOWNLOAD_REPO)
            template = <DownloadRepo baseUrl={BASE_URL} url={this.state.url} restartApp={this.restartApp} startBuildingRepo={this.startBuildingRepo}/>;
        else if (this.state.condition === CONDITION_BUILD_REPO)
            template = <BuildRepo baseUrl={BASE_URL} restartApp={this.restartApp} startLaunchingApp={this.startLaunchingApp} />;
        else if (this.state.condition === CONDITION_LAUNCH_APP)
            template = <LaunchRepo baseUrl={BASE_URL} deviceId={this.state.deviceId} restartApp={this.restartApp}/>;
        
        
            
        return (
                <Grid>
                    <Row>
                        <Col xs={12}>{template}</Col> 
                    </Row>
                </Grid>
        );
    }
}

export default App;