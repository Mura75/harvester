import React, {Component} from 'react'
import "whatwg-fetch"

class ChooseDevices extends Component {
    constructor(props) {
        super(props);
        
        this.state = {devices: [], status: 'success', message: ''};
        
        this.refreshDevices = this.refreshDevices.bind(this);
        this.setDevice = this.setDevice.bind(this);
    }
    
    refreshDevices() {
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
    }
    
    componentDidMount() {
        this.refreshDevices();
    }
    
    setDevice(event) {
        let id = event.target.value;
        this.props.setDeviceThenStartDownloading(id);
    }
    
    render() {
        return (
            <div>
                {this.state.status != 'success' && <p>{this.state.message}</p>}
                <p>Devices <button onClick={this.refreshDevices}>refresh</button>: </p>
                {
                    this.state.devices.length === 0 ? (
                            <p>No Devices connected!</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr><th>ID</th><th>Name</th><th>Select</th></tr>
                                </thead>
                                <tbody>
                                    {this.state.devices.map((elem) => {
                                        return <tr key={elem.id}><td>{elem.id}</td><td>{elem.description}</td><td><button value={elem.id} onClick={this.setDevice}>Select</button></td></tr>
                                    })}
                                </tbody>
                            </table>
                        )
                }
            </div>
        )
    }
    
}

export default ChooseDevices