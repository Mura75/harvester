import React, {Component} from 'react'
import "whatwg-fetch"
import oboe from "oboe"

const CONDITION_STARTED = 0;
const CONDITION_FINISHED = 1;
const CONDITION_ERROR = 2;


class LaunchRepo extends Component {
    constructor(props) {
        super(props);
        this.state = {condition: CONDITION_STARTED, message: ''};
        
        this.startLaunch = this.startLaunch.bind(this);
    }
    
    startLaunch() {
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
            return <h1>Launching {this.state.message.length > 1 ? this.state.message : '...'}</h1>;
        else if (this.state.condition === CONDITION_ERROR)
            return <h1>Error: {this.state.message}, <button onClick={this.props.restart}>Start Again</button></h1>;
        else if (this.state.condition === CONDITION_FINISHED)
            return <h1>Launched <button onClick={this.props.restart}>Start Again</button></h1>;
    }
    
}

export default LaunchRepo;