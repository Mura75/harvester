import React, {Component} from 'react'
import "whatwg-fetch"

import {PageHeader, Button, Image, Alert} from 'react-bootstrap'

const CONDITION_STARTED = 0;
const CONDITION_FINISHED = 1;
const CONDITION_ERROR = 2;


class DownloadRepo extends Component {
    constructor(props) {
        super(props);
        
        this.state = {condition: CONDITION_STARTED, message: ''};
    }
    
    downloadRepo = () => {
        fetch(`${this.props.baseUrl}/download?url=${this.props.url}`)
            .then((response) => {return response.json()})
            .then((json) => {
                if (json.status === 'success') {
                    this.setState({condition: CONDITION_FINISHED});
                    this.props.startBuildingRepo();
                }
                else
                    this.setState({condition: CONDITION_ERROR, message: json.data});
            }).catch((error) => {
                console.log(error);
                this.setState({condition: CONDITION_ERROR, message: error});
            })
    };
    
    componentDidMount() {
        this.downloadRepo();
    }
    
    render() {
        if (this.state.condition === CONDITION_STARTED)
            return (
            <div>
                <PageHeader>Downloading...</PageHeader>
                <Image src="./styles/gifs/default_loading.gif" className="center-block" responsive/>
            </div>
                
            );
        else if (this.state.condition === CONDITION_FINISHED)
            return (
                <div>
                    <PageHeader>Downloading...</PageHeader>
                </div>
                )
        else if (this.state.condition === CONDITION_ERROR)
            return (
                    <Alert bsStyle="danger">
                        <PageHeader>Error when downloading repo</PageHeader>
                        <p>
                            {this.state.message}
                        </p>
                        <p>
                            <Button bsStyle="default" onClick={this.props.restartApp}>Start Again</Button>
                        </p>
                    </Alert>
                )
    }
}

export default DownloadRepo;