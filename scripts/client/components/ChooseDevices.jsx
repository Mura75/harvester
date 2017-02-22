import React, {Component} from 'react'
import "whatwg-fetch"

import {Table, PageHeader, Button, Glyphicon, Alert} from "react-bootstrap"

class ChooseDevices extends Component {
    constructor(props) {
        super(props);
        
        this.state = {devices: [], status: 'success', message: ''};
    }
    
    refreshDevices = () => {
        fetch(`${this.props.baseUrl}/android_devices`)
            .then((response) => {return response.json()})
            .then((json) => {
                if (json.status === 'success') 
                    this.setState({status: json.status, devices: json.data});
                else
                    this.setState({status: json.status, devices: [], message: json.data})
            }).catch((error) => {
                this.setState({status: 'error', devices: [], message: error})
            });
    };
    
    componentDidMount() {
        this.refreshDevices();
    }
    
    setDevice = (event) => {
        let id = event.target.value;
        this.props.setDeviceThenStartDownloading(id);
    };
    
    render() {
        return (
            <div>
                {this.state.status != 'success' && <p>{this.state.message}</p>}
                <PageHeader>Devices <Button onClick={this.refreshDevices}><Glyphicon glyph="refresh"/></Button>: </PageHeader>
                {
                    this.state.devices.length === 0 ? (
                        <Alert bsStyle="warning"><p>No Devices are connected!</p></Alert>
                        ) : (
                            <Table responsive>
                                <thead>
                                    <tr><th>ID</th><th>Name</th><th>Select</th></tr>
                                </thead>
                                <tbody>
                                    {this.state.devices.map((elem) => {
                                        let unrecognized = (elem.description.indexOf('unrecognized') !== -1 || elem.description.indexOf('unauthorized') !== -1);
                                        return <tr key={elem.id} className={unrecognized ? 'warning' : 'default'}>
                                            <td>{elem.id}</td>
                                            <td>{elem.description}</td>
                                            <td>
                                                <Button bsStyle="default" disabled={unrecognized} value={elem.id} onClick={this.setDevice}>Select</Button>
                                            </td>
                                        </tr>
                                    })}
                                </tbody>
                            </Table>
                        )
                }
            </div>
        )
    }
    
}

export default ChooseDevices