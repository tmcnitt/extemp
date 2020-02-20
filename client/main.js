// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')

const fs = require('fs')

const sqlite3 = require('sqlite3')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1600, height: 1200})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  ipcMain.on("sync", () => {

    const split = (d) => {
        return parseInt(d.split('.')[0])
    }

    let db = new sqlite3.Database('./data/master.db')
    let config = JSON.parse(fs.readFileSync('./data/config.json').toString())
    let newest = split(config.last)

    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS articles (url text, title text, date text, article text, keywords text, summary text, html text, md5 text)')

        let before = 0;
        db.get('SELECT count(*) from articles', (err, result) => {
            before = result['count(*)']
        })

        const files = fs.readdirSync('./data/pending')

        if(!files.length){
            mainWindow.webContents.send("syncFinish", 0)
            return
        }

        for(let i = 0; i < files.length; i++){
            db.serialize(() => {
                db.run("ATTACH './data/pending/" + files[i] + "' as db2")
                db.run("INSERT INTO articles select * from db2.articles")
                db.run("DETACH db2", () => {
                    fs.unlinkSync('./data/pending/' + files[i])
                    mainWindow.webContents.send("syncUpdate", [i, files.length])

                    const check = split(files[i])

                    if(check > newest){
                        newest = check
                    }
                })
            })

            
        }

        db.get('SELECT count(*) from articles', (err, result) => {
                mainWindow.webContents.send("syncFinish", {count: result['count(*)']-before, last: newest + '.db'})
        })
    })

  })

  ipcMain.on("search", (e, request) => {
    let search = request.search

    let term = "title"
    if(request.content) term = "article"

    //find entire phrase "test test"

    let phrases = search.match(/"(.*?)"/g)

    if(phrases && phrases.length){
        phrases = phrases.map((phrase) => {
            //Remove from string
            search = search.replace(phrase, '')

            return phrase.substring(1, phrase.length-1)
        })
    }


    //don't inclue test in -test

    let negate = search.match(/-(.*?)[^ ]+/g)

    if (negate && negate.length){
        negate = negate.map((neg) => {
            search = search.replace(neg, '')
            
            return neg.substring(1, neg.length)
        })
    }

    //fix spaces
    search = search.replace(/\s\s+/g, ' ');


    //build query

    //if we've started the query
    let started = false

    const base = "SELECT * FROM articles WHERE"
    let query = base

    let terms = search.split(' ')
    terms = terms.filter(term => term.length > 0)

    if(terms && terms.length){
        started = true;

        query += " ( "

        for(let i = 0; i < terms.length; i++){

            terms[i] = terms[i].replace(/\s/g, '')


            query += term + " LIKE '%" + terms[i] + "%'"

            if(i != terms.length-1){
                query += " AND "
            }

            if(i == terms.length-1){
                query += " ) "
            }
        }
    }

    if(negate && negate.length){
        if(started){
            query += " AND ( "
        } else {
            query += " ( "
        }

        started = true

        for(let i = 0; i < negate.length; i++){
            query += term + " NOT LIKE '%" + negate[i] + "%'"

            if(i != negate.length-1){
                query += " AND "
            }

            if(i == negate.length-1){
                query += " ) "
            }
        }
    }

    if(phrases && phrases.length){

        if(started){
            query += " AND ( "
        } else {
            query += " ( "
        }

        started = true

        for(let i = 0; i < phrases.length; i++){
            query += term + " LIKE '%" + phrases[i] + "%'"

            if(i != phrases.length-1){
                query += " AND "
            }

            if(i == phrases.length-1){
                query += " ) "
            }
        }
    }

    let db = new sqlite3.Database('./data/master.db')

    db.all(query, (err, result) => {
            //Don't return undefined, returned empty array
            result = result || []
        
            mainWindow.webContents.send("searchFinish", result)
    })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.