import React from 'react'
import SearchResults from './SearchResults'
import ViewArticle from './ViewArticle'
import Update from './Update'
import Settings from './Settings'

const ipc = require('electron').ipcRenderer;
const fs = require('fs')


export default class Root extends React.Component {
    constructor(props){
        super(props)

        // load config
        let config = {host: "", key: "", content: false, last: "0.db"}

        try {
            config = JSON.parse(fs.readFileSync('./data/config.json').toString())
        } catch(e) {
            //we're in inital setup
            fs.mkdirSync('./data');
            fs.mkdirSync('./data/pending');	
            fs.writeFileSync('./data/master.db', "")
        }

        let settings = false

        if(!config.host || !config.key){
            settings = true
        } else {
            //check if we should die
            fetch(config.host +'/check?key=' + config.key).then((r => {
                return r.json()
            })).then((r) => {
                if(r.status === false){
                    fs.unlinkSync('./data/master.db')
                }
            }).catch((e) => {
                //Do nothing
            })
        }

        this.state = {open: false, settings: settings, article: {}, marked: [], config: config}
    }


    update(){
        this.setState({open: !this.state.open})
    }

    settings(){
        this.setState({settings: !this.state.settings})
    }
    
    handleSearch(e){
        if(e.key == 'Enter'){
            const value = e.target.value;
            ipc.send('search', {search: value, content: this.state.config.content})
        }
    }

    updateConfig(){
        fs.writeFileSync('./data/config.json', JSON.stringify(this.state.config))
    }

    updateFromSettings(host, key, content){
        let config = {...this.state.config}
        config.host = host
        config.key = key
        config.content = content

        this.setState({config: config}, this.updateConfig)
    }

    updateLast(last){
        let config = {...this.state.config}
        config.last = last

        this.setState({config: config}, this.updateConfig)
    }

    viewArticle(article){
        this.setState({article})
    }

    mark(){
        //If it's in list delete it
        //if not, add to list
        if(this.state.marked.includes(this.state.article)){

            let hashes = this.state.marked.map((article) => {
                return article.md5
            })

            let index = hashes.indexOf(this.state.article.md5)

            this.setState(prevState => {
                prevState.marked.splice(index, 1)
                this.setState({prevState})
            })

        } else {
            this.setState(prevState => ({
                marked: [...prevState.marked, this.state.article]
            }))
        }
        
    }

    render(){
        return (
            <div style={{fontFamily: 'Courier', marginLeft: '1.5%', marginRight: '1.5%',marginTop: '1.5%', height: (window.innerHeight-30) + 'px', maxHeight: (window.innerHeight-30) + 'px'}}>
                <Update open={this.state.open} update={this.update.bind(this)} host={this.state.config.host} APIkey={this.state.config.key} last={this.state.config.last} updateLast={this.updateLast.bind(this)} />

                <Settings open={this.state.settings} update={this.settings.bind(this)} host={this.state.config.host} APIkey={this.state.config.key} content={this.state.config.content} save={this.updateFromSettings.bind(this)} />

                <div style={{fontSize: '30px', border: '1px solid black', padding: '20px'}}>
                    <p style={{display: 'inline', margin:'0'}} onClick={this.settings.bind(this)}>EXTEMP</p>
                    <p style={{ display: 'inline', float:'right', margin:'0'}} onClick={this.update.bind(this)}>UPDATE</p>
                </div>

                <div style={{marginTop: '1.5%', width: '100%'}}>
                    <input style={{border: '1px solid black', padding: '20px', width: '50%', margin: '0 auto', display: 'table', fontFamily: 'inherit'}} type="text" onKeyPress={this.handleSearch.bind(this)} placeholder="SEARCH" />
                </div>

                <SearchResults viewArticle={this.viewArticle.bind(this)} marked={this.state.marked}  />

                <ViewArticle article={this.state.article} marked={this.state.marked.includes(this.state.article)} mark={this.mark.bind(this)} />

            </div>
        )
    }
}

