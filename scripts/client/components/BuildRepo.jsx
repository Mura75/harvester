import React, {Component} from 'react'
import "whatwg-fetch"
import oboe from "oboe"

import {Button, PageHeader, Image, Alert} from "react-bootstrap"

const CONDITION_STARTED = 0;
const CONDITION_FINISHED = 1;
const CONDITION_ERROR = 2;

class BuildRepo extends Component {
    constructor(props) {
        super(props);
        
        this.state = {condition: CONDITION_STARTED, message: ''};
        
    }
    
    startBuilding = () => {
        console.log("STARTED BUILDING");
        
        this.oboe = oboe(`${this.props.baseUrl}/build`)
            .node('{status data}', (json) => {
                   
                    if (json.status === 'loading') {
                        this.setState({condition: CONDITION_STARTED});
                        if (json.data.length > 2)
                            this.setState({message: json.data});
                        else
                            this.setState({message: ''});
                    } else if (json.status === 'success') {
                        this.setState({condition: CONDITION_FINISHED});
                        this.props.startLaunchingApp();
                    } else if (json.status === 'error') {
                        this.setState({condition: CONDITION_ERROR, message: json.data});
                    }    
                
                
            }).done((result) => {
                
            });
        
    };
    
    componentDidMount() {
        this.startBuilding();
    }
    
    componentWillUnmount() {
        if (this.oboe)
            this.oboe.abort();
    }
    
    render() {
        if (this.state.condition === CONDITION_STARTED)
            return (
                <div>
                    <PageHeader>Building..</PageHeader>
                    <Image src="./styles/gifs/default_loading.gif" className="center-block" responsive/>
                    {
                        this.state.message.length > 0 ?
                            <PageHeader><small>Installing {this.state.message}</small></PageHeader> : ""
                    }
                </div>
            )
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
            return <Alert bsStyle="success"><p>Finished BUILDING</p></Alert>;
    }
}

export default BuildRepo