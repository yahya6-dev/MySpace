//our database , model and scheme definition

let initDB = function(env){
  const mongoose = require("mongoose")
  //import our database credentials
  const {connectionString} = require(`./credentials-${env}`)
  
  mongoose.connect(connectionString)
  let db = mongoose.connection
  let {user,article,brief,newsletter} = require("./lib/schemes") 
  //define our app schemes
  let userScheme =  mongoose.Scheme(user)
  let briefScheme = mongoose.Scheme(brief)
  let articleScheme = mongoose.Scheme(article)
  let newsletterScheme = mongoose.Scheme(newsletter)

  //define our models
  let userModel = mongoose.model("user",userScheme)
  let briefModel = mongoose.model("brief",briefScheme)
  let articleModel = mongoose.model("article",articleScheme)
  let newsletterModel = mongoose.model("newsletter",newsletterScheme)

  return [db,userModel,briefModel,articleModel,newsletterModel]
}


module.exports = initDB