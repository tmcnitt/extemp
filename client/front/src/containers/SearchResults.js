import React from 'react'

import Update from './Update'

const ipc = require('electron').ipcRenderer;


export default class SearchResults extends React.Component {
    constructor(props){
        super(props)

        this.state = {articles: [], marks: false}
        ipc.on("searchFinish", (e, stats) => {
            this.setState({articles: stats})
        })
    }

    toggleMarks(){
        this.setState({marks: !this.state.marks})
    }

    render(){
        let output = []

        let count = 0

        if(this.state.marks && this.props.marked){
            count = this.props.marked.length

            for(let i = 0; i < this.props.marked.length; i++){
                output.push((
                    <div style={{borderBottom: '1px solid black', padding: '10px'}} onClick={() => this.props.viewArticle(this.props.marked[i])} key={this.props.marked[i].md5}>
                        <p>{this.props.marked[i].title}</p>
                    </div>
                ))
            }
        } else {
            count = this.state.articles.length

            for(let i = 0; i < this.state.articles.length; i++){
                output.push((
                    <div style={{borderBottom: '1px solid black', padding: '10px'}} onClick={() => this.props.viewArticle(this.state.articles[i])} key={this.state.articles[i].md5}>
                        <p>{this.state.articles[i].title}</p>
                    </div>
                ))
            }
        }
        
        let status = "MARKS"
        if(this.state.marks){
            status = "SEARCHES"
        }

        return (
            <div style={{marginTop: '1.5%', width: '30%', float: 'left',border: '1px solid black', height: '80%', overflowY: 'scroll'}}>
                <div style={{borderBottom: '1px solid black', paddingBottom: '3%', paddingTop: '3%', position: 'relative'}}>
                    <p style={{position: 'absolute', padding: '3px', display: 'inline-block', top: '-17px', left: '0px', borderRight: '1px solid black', borderBottom: '1px solid black'}} onClick={this.toggleMarks.bind(this)}>{status}</p>
                    <p style={{display: 'table', margin: '0 auto', marginTp: '3%'}}>{count} RESULTS</p>
                </div>
                    {output}
            </div>
        )
    }
}

