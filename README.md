##Project EA 2016-17 Group 3
Combining Nutrition with Physical preparation this application acts as a hub between healthy food delivery, trainers and clients.

The technologies used are part of the MEAN 2.0:
 * MongoDB
 * NodeJS
 * ExpressJS
 * AngularJS 2

**~~------------------------~~**

**In order to start the project do the following:**

> Make sure MongoDB service is running

 1. inside    _/_          `sudo npm install`
 2. inside _/public/_   `sudo npm install`
 3. inside _/public/_   `sudo npm install --save @types/core-js @types/jasmine @types/node`

Then run app.js and the server will start, connect to the Database and display the index.html


##Style Guide
https://github.com/felixge/node-style-guide




##To locally import test data into MongoDB
On folder /data

 - mongoimport --db foodsports --collection users --drop < users.json
 - mongoimport --db foodsports --collection users --drop < users2.json

##To start MongoDB locally:
 -Linux: mongod
 -Windows:  mongod --dbpath D:\Servers\data --port 27017