import React, {Component} from 'react'
import "whatwg-fetch"

import {Alert, Button} from "react-bootstrap"

const CONDITION_STARTED = 0;
const CONDITION_FINISHED = 1;
const CONDITION_ERROR = 2;

class AndroidHome extends Component{
    constructor(props) {
        super(props);
        this.state = {condition: CONDITION_STARTED};
    }
    
    componentDidMount() {
        this.getAndroidHome();
    }

    getAndroidHome = () => {
        fetch(`${this.props.baseUrl}/android_path`)
            .then((response) => {return response.json()})
            .then((json) => {
                if (json.status === "success") {
                    this.setState({condition: CONDITION_FINISHED, home: json.data});
                    this.props.renderUrlInput();
                }
                else
                    this.setState({condition: CONDITION_ERROR})
            }).catch((error) => {
                this.setState({condition: CONDITION_ERROR});
            });
    };
    
    render() {
        if (this.state.condition === CONDITION_STARTED) {
            return <Alert bsStyle="info"><p>Searching for ANDROID_HOME</p></Alert>;
        } else if (this.state.condition === CONDITION_FINISHED) {
            return <Alert bsStyle="success">ANDROID_HOME is {this.state.home}</Alert>
        } else
            return <Alert bsStyle="danger">ANDROID_HOME does not exist <Button onClick={this.getAndroidHome}>Retry</Button></Alert>
    }
}

export default AndroidHome;