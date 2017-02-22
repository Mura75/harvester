import React, {Component} from 'react'
import "whatwg-fetch"
import oboe from "oboe"

import {Button, PageHeader, Image, Alert} from "react-bootstrap"


const CONDITION_STARTED = 0;
const CONDITION_FINISHED = 1;
const CONDITION_ERROR = 2;


class LaunchRepo extends Component {
    constructor(props) {
        super(props);
        this.state = {condition: CONDITION_STARTED, message: ''};
    }
    
    startLaunch = () => {
        console.log("STARTED LAUNCHING");
        
        this.oboe = oboe(`${this.props.baseUrl}/launch?deviceId=${this.props.deviceId}`)
            .node('{status data}', (json) => {
                
                    if (json.status === 'loading') {
                        if (json.data.length > 2)
                            this.setState({message: json.data});
                        else
                            this.setState({message: ''});
                    } else if (json.status === 'success') {
                        this.setState({condition: CONDITION_FINISHED});
                    } else if (json.status === 'error') {
                        this.setState({condition: CONDITION_ERROR, message: json.data});
                    }    
                
                
            }).done((result) => {
                
            });
    }
    
    componentDidMount() {
        this.startLaunch();
    }

    componentWillUnmount() {
        if (this.oboe)
            this.oboe.abort();
    }
    
    
    render() {
        if (this.state.condition === CONDITION_STARTED)
            return (
            <div>
                <PageHeader>Launching </PageHeader>
                <Image src="./styles/gifs/default_loading.gif" className="center-block" responsive/>
                <PageHeader><small>{this.state.message.length > 1 ? this.state.message : '...'}</small></PageHeader>
            </div>
            );
        else if (this.state.condition === CONDITION_ERROR)
            return (
                <Alert bsStyle="danger">
                    <h3>Error: </h3>
                    <p>
                        {this.state.message}
                    </p>
                    <p>
                        <Button onClick={this.props.restartApp}>Start Again</Button>
                    </p>
                </Alert>
                );
        else if (this.state.condition === CONDITION_FINISHED)
            return (
                <Alert bsStyle="success">
                    <h3>Launched </h3>
                    <p>
                        <Button onClick={this.props.restartApp}>Start Again</Button>
                    </p>
                </Alert>
            );
    }
    
}

export default LaunchRepo;