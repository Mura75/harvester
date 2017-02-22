import React, {Component} from 'react'
import "whatwg-fetch"

import {InputGroup, FormControl, Button, PageHeader} from "react-bootstrap"

class UrlInput extends Component {
    constructor(props) {
        super(props);
        
        this.state = {value: ''};
    }
    
    handleChange = (event) => {
        this.setState({value: event.target.value});
    };
    
    handleSubmit = (event) => {
        event.preventDefault();
        if (this.state.value.length > 0) {
            this.props.setUrlThenMoveToDevices(this.state.value);
        }
    };
    
    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <PageHeader>Harvester</PageHeader>
                <InputGroup>
                    <FormControl type="url" placeholder="Enter url" value={this.state.value} onChange={this.handleChange}/>
                    <InputGroup.Button>
                        <Button type="submit" bsStyle="primary">GO</Button>
                    </InputGroup.Button>
                </InputGroup>
            </form>
        )
    }
}

export default UrlInput