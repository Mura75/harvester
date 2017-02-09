import React, {Component} from 'react'
import "whatwg-fetch"


const CONDITION_STARTED = 0;
const CONDITION_FINISHED = 1;
const CONDITION_ERROR = 2;

class AndroidHome extends Component{
    constructor(props) {
        super(props);
        this.state = {condition: CONDITION_STARTED}
        
        this.getAndroidHome = this.getAndroidHome.bind(this);
    }
    
    componentDidMount() {
        this.getAndroidHome();
    }

    getAndroidHome() {
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
    }
    
    render() {
        if (this.state.condition === CONDITION_STARTED) {
            return <h1>Searching for ANDROID_HOME</h1>;
        } else if (this.state.condition === CONDITION_FINISHED) {
            return <h1>ANDROID_HOME is {this.state.home}</h1>
        } else
            return <h1>ANDROID_HOME does not exist</h1>
    }
}

export default AndroidHome;