# Extemp
Application designed for use in competitive forensics.

# Server
The server is built with python3 and flask. There is code that runs everyday to scrape news from common sites and store in sqlite3 databases. The files are served and managed by a flask HTTP server.

# Client
The client is based on electron and react.js. It is designed to look very minimalistic but functional. The client displays news offers users the ability to search as well as save it to a shortlist. The client also handles communicating with the server and deciding which files it does not have. It combines them with its own sqlite3 database to stay up to date. 

# Photo
![Image of Application](https://raw.githubusercontent.com/Troy-M/extemp/master/sample/demo.png?token=AC4QTFOAV2S7UHHKJRYULPS6K4G4O)
