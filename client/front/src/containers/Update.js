import React from 'react'

const fs = require('fs')

//We need this bc client js isn't good with writing files
const https = require('http')
const MASTER_DB = "./data/master.db"

const ipc = require('electron').ipcRenderer;


export default class Update  extends React.Component {
    constructor(props){
        super(props)

        this.state = {stepStarted: -1, stepFinished: -2, comment: "", failed: false}
    }

    startStep(step){
        this.setState({stepStarted: step, stepFinished: step-1, comment: "", failed: false})
    }

    setComment(comment){
        this.setState({comment: comment})
    }

        
    //Step one - get manifest
    //Step two - download files
    //Step three - merge databases
    startSync(){
        this.startStep(0)
        fetch(this.props.host + '/manifest' + "?key=" + this.props.APIkey).then((r => {
            return r.json()
        })).then((r) => {
            if(r.files.length > 0){
                this.getFiles(r.files)
            } else {
                throw 'manifest too short'
            }
        }).catch((e) => {
            console.error(e)
            this.setState({failed: true})
        })
    }

    //Step 2
    //Check the latest file we downloaded
    //Check the server for all files
    //Find out which ones we don't have
    //Makes request to get those and write to disk
    getFiles(manifest){
        this.startStep(1)

        //We need to get the current manifest files
        //and decide what new ones we need
        
        let toDownload = []

        manifest.forEach((m) => {

            const split = (d) => {
                return parseInt(d.split('.')[0])
            }

            const last = split(this.props.last)
            const check = split(m)

            if(check > last){
                toDownload.push(m)
            }
        })

        this.setComment(" - (0 OF " + toDownload.length + ")")

        let promises = []

        for(let i = 0; i < toDownload.length; i++){
            const stream = fs.createWriteStream('./data/pending/' + toDownload[i])

            let promise = new Promise((resolve, reject) => {
                https.get(this.props.host + "/get?file=" + toDownload[i] + "&key=" + this.props.APIkey, (res) => {
                    res.on('data', (d) => {
                        stream.write(d)
                    })

                    res.on('end', () => {
                        this.setComment(" (" + (i+1) +  " OF " + toDownload.length + ")")					
                        stream.end()
                        resolve()
                    })
                })
            })

            promises.push(promise)
        }

        Promise.all(promises).then(() => {
            try{
                this.updateDB();
            } catch(e){
                console.error(e)
                this.setState({failed: true})
            }
        })
    }

    //Take every DB written to disk
    //Update all those records into master DB
    //Delete from disk
    //Update latests file
    updateDB(){
        this.startStep(2)

        ipc.send("sync")

        ipc.on("syncUpdate", (e, stats) => {
            this.setComment(" - (" + (stats[0]+1) + " OF " + stats[1] + ")")
        })

        ipc.on("syncFinish", (e, stats) => {
    
            //function just returns 0 if no new files were found
            let count = 0
            if(stats.last){
                this.props.updateLast(stats.last)
                count = stats.count
            }
            
            this.setState({stepFinished: 2, comment: " - " + count + " LOADED"})

        })
        
    }


    render(){
        if (!this.props.open){
            return null
        }	

        let failed = null
        if(this.state.failed){
            failed = (<p style={{display: 'inline'}}> - FAILED </p>)
        }

        let complete = []
        for(let i = 0; i < 3 && failed == null; i++){
            if(this.state.stepStarted >= i){
                let progress = ""
                if(this.state.stepFinished >= i){
                    progress = "- DONE"
                } else {
                    progress = "- WORKING"
                }

                if(this.state.stepStarted == i){
                    progress += this.state.comment
                }

                complete.push(<p style={{display: 'inline'}}> {progress} </p>)
            }
        }

        return (
                <div style={{position: 'fixed', display: 'table', background: 'white', height: 'auto', margin: 'auto', width: '30%', top: '10%', left: '35%', transform: 'translate(-50%, -%50)', 'backgroundColor': 'rgba(255,255,255,1)', border: '1px solid black', zIndex: 1}}>
                    <p style={{margin: '15px', fontSize: '30px'}} onClick={this.startSync.bind(this)}>START SYNC</p>
                    <div>
                        <p style={{'margin': '15px'}}>CONTACT SERVER {failed} {complete[0]}</p>
                        <p style={{'margin': '15px'}}>DOWNLOAD MANIFEST {failed} {complete[1]}</p>
                        <p style={{'margin': '15px'}}>UPDATE DATABASE {failed} {complete[2]}</p>
                    </div>

                    <p style={{margin: '15px', fontSize: '30px'}} onClick={this.props.update}>CLOSE</p>
                </div>
        )
    }
}

