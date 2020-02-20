import React from 'react'

const HOST = "http://localhost:5000"


export default class Settings extends React.Component {
    constructor(props){
        super(props)
        this.state = {host: this.props.host, key: this.props.APIkey, content: this.props.content}
    }


    close(){
        this.props.save(this.state.host, this.state.key, this.state.content)
        this.props.update()
    }

    render(){
        if (!this.props.open){
            return null
        }	

        let term = "SEARCH TITLE"
        if(this.state.content) term = "SEARCH CONTENT"

        return (
                <div style={{position: 'fixed', display: 'table', background: 'white', height: 'auto', margin: 'auto', width: '30%', top: '10%', left: '35%', transform: 'translate(-50%, -%50)', 'backgroundColor': 'rgba(255,255,255,1)', border: '1px solid black', zIndex: 1}}>
                    <p style={{margin: '15px', fontSize: '30px'}}>SETTINGS</p>
                    <div style={{margin: '15px'}}>
                        <label style={{width: '100px', display: 'inline-block', float: 'left', clear: 'left', textAlign: 'left'}}>SERVER IP  </label><input onChange={e => this.setState({host: e.target.value})} style={{border: '1px solid black', padding: '20px', width: '50%', margin: '0 auto', display: 'inline-block', fontFamily: 'inherit'}} type="text" value={this.state.host} /> <br />
                        <div style={{marginTop: '20px'}}><label style={{width: '100px', display: 'inline-block', float: 'left', clear: 'left', textAlign: 'left'}}>KEY  </label><input onChange={e => this.setState({key: e.target.value})} style={{border: '1px solid black', padding: '20px', width: '50%', margin: '0 auto', display: 'inline-block', fontFamily: 'inherit'}} type="text" value={this.state.key} /></div>
                        <p onClick={e => this.setState({content: !this.state.content})}>{term} </p>
                    </div>

                    <p style={{margin: '15px', fontSize: '30px'}} onClick={this.close.bind(this)}>CLOSE</p>
                </div>
        )
    }
}

