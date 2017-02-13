import React, {Component} from 'react'
import "whatwg-fetch"
import oboe from "oboe"

const CONDITION_STARTED = 0;
const CONDITION_FINISHED = 1;
const CONDITION_ERROR = 2;

class BuildRepo extends Component {
    constructor(props) {
        super(props);
        
        this.state = {condition: CONDITION_STARTED, message: ''};
        
        this.startBuilding = this.startBuilding.bind(this);
    }
    
    startBuilding() {
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
        
    }
    
    componentDidMount() {
        this.startBuilding();
    }
    
    componentWillUnmount() {
        if (this.oboe)
            this.oboe.abort();
    }
    
    render() {
        if (this.state.condition === CONDITION_STARTED)
            if (this.state.message.length > 0)
                return <h1>Installing {this.state.message}</h1>;
            else 
                return <h1>Building...</h1>;
        else if (this.state.condition === CONDITION_ERROR)
            return <h1>Error: {this.state.message}. <button onClick={this.props.restartApp}>Start Again</button></h1>;
        else if (this.state.condition === CONDITION_FINISHED)
            return <h1>Finished BUILDING</h1>;
    }
}

export default BuildRepo