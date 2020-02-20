import React from 'react'
import SearchResults from './SearchResults'
import Update from './Update'

const ipc = require('electron').ipcRenderer;

const marked = require('marked')

export default class ViewArticle extends React.Component {
    constructor(props){
        super(props)
        this.state = {viewRaw: false}
    }	

    toggleRAW(){
        this.setState({viewRaw: !this.state.viewRaw})
    }

    render(){
        if(!this.props.article.title){
            return (<div></div>)
        }	

        if(this.props.article.date == "00/00/00" || this.props.article.date.includes('?')){
            let split = this.props.article.html.split("\n")

            let matches = []
            split.forEach((maybe) => {
                const regex_1 = /(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.]((19|20)[0-9]{2}|[0-9][0-9])/g

                if(regex_1.test(maybe)){
                    matches.push(maybe.match(regex_1))
                }	

                const regex_2 = /((Jan)|(January)|(February)|(feb)|(Mar)|(March)|(Apr)|(April)|(May)|(Jun)|(June)|(Jul)|(July)|(Aug)|(August)|(Sep)|(Setpember)|(Oct)|(October)|(Nov)|(Novemebr)|(Dec)|(December))(\.\s|\s)([1-9]|([12][0-9])|(3[01])),\s\d\d\d\d/g

                if (regex_2.test(maybe)){
                    matches.push(maybe.match(regex_2))
                }

            })

            if(matches && matches.length){
                this.props.article.date = matches[0] + "?"
            }
        }


        let text = null
        if(this.state.viewRaw){
            if(this.props.article.html.length > 30000){
                this.props.article.html = this.props.article.html.slice(0, 30000);
            }
            
            text = <div dangerouslySetInnerHTML={{ __html: "<p>" + this.props.article.url + "</p>" + marked(this.props.article.html)}} />
        } else {
            text =( <div>{ this.props.article.article.split("\n").map((i,key) => {
                        return <p key={key}>{i}</p>;
                    })} </div> ) 
        }

        let term = "MARK"
        if(this.props.marked) term = "UNMARK"

        return (
            <div style={{position: 'absolute', border: '1px solid black', margin: '1.5%',  padding: '1%', width: '63%', display: 'inline', overflowY: 'scroll', maxHeight: '75%'}}>
                <div style={{position: 'absolute', top: '0px', left: '0px', padding: '3px', paddingRight: '4px', borderBottom: '1px solid black', borderRight: '1px solid black', display: 'inline'}} onClick={this.toggleRAW.bind(this)}>RAW</div>
                <div style={{position: 'absolute', top: '0px', right: '0px', padding: '3px', paddingRight: '4px', borderBottom: '1px solid black', borderLeft: '1px solid black', display: 'inline'}} onClick={this.props.mark}>{term}</div>
                <p style={{fontSize: '20px'}}>{this.props.article.date} - {this.props.article.title} - {this.props.article.url.split('://')[1].split('/')[0]} </p>
                <p style={{fontSize: '15px', lineHeight: 1.5}}> {text} </p>
            </div>
        )
    }
}

