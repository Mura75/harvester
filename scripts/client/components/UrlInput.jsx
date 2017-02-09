import React, {Component} from 'react'
import "whatwg-fetch"

class UrlInput extends Component {
    constructor(props) {
        super(props);
        
        this.state = {value: ''};
        
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    handleChange(event) {
        this.setState({value: event.target.value});
    }
    
    handleSubmit(event) {
        event.preventDefault();
        if (this.state.value.length > 0) {
            this.props.setUrlThenMoveToDevices(this.state.value);
        }
    }
    
    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input type="url" placeholder="enter url" value={this.state.value} onChange={this.handleChange}/>    
                <input type="submit" value="GO"/>
            </form>
        )
    }
}

export default UrlInput