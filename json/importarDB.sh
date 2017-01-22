#! /bin/bash #

mongoimport --db foodsports --collection usermodels --drop --file usersimpleOK.json --jsonArray
mongoimport --db foodsports --collection contactmodels --drop --file contactmodels.json --jsonArray
mongoimport --db foodsports --collection conversationmodels --drop --file conversationmodels.json --jsonArray
mongoimport --db foodsports --collection publicationmodels --drop --file publicationmodels.json --jsonArray
mongoimport --db foodsports --collection runmodels --drop --file runmodels.json --jsonArray
