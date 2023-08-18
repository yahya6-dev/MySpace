//our database , model and scheme definition

let initDB = function(env){
  const mongoose = require("mongoose")
  //import our database credentials
  const {connectionString} = require(`../credentials-${env}`)
  
  mongoose.connect(connectionString)
  let db = mongoose.connection
  
  db.on("error",(err) => console.error(err))
  db.once("open",() => console.log("Database connection opened!"))
  return db
}


module.exports = initDB
