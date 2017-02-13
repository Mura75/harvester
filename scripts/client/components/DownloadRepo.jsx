import React, {Component} from 'react'
import "whatwg-fetch"

const CONDITION_STARTED = 0;
const CONDITION_FINISHED = 1;
const CONDITION_ERROR = 2;


class DownloadRepo extends Component {
    constructor(props) {
        super(props);
        
        this.state = {condition: CONDITION_STARTED, message: ''};
        
        this.downloadRepo = this.downloadRepo.bind(this);
    }
    
    downloadRepo() {
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
    }
    
    componentDidMount() {
        this.downloadRepo();
    }
    
    render() {
        if (this.state.condition === CONDITION_STARTED)
            return <h1>Downloading...</h1>;
        else if (this.state.condition === CONDITION_FINISHED)
            return <h1>Downloaded</h1>;
        else if (this.state.condition === CONDITION_ERROR)
            return <h1>Error when downloading repo. {this.state.message}. <button onClick={this.props.restartApp}>Start Again</button></h1>
    }
}

export default DownloadRepo;