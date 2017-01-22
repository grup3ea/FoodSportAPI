#! bash#

mongoimport --db test --collection usersmodels --drop --file usercollection.json
mongoimport --db test --collection chefmodels --drop --file contactmodels.json
mongoimport --db test --collection contactmodels --drop --file publicationmodels.json
mongoimport --db test --collection publicationmodels --drop --file trainermodels.json
mongoimport --db test --collection chefmodels --drop --file chefmodels.json
