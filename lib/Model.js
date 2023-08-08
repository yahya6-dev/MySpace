let mongoose = require("mongoose")

let {user,article,brief,newsletter,subscription} = require("./schemes") 
//define our app schemes
let userScheme =  mongoose.Schema(user)
let briefScheme = mongoose.Schema(brief)
let articleScheme = mongoose.Schema(article)
let newsletterScheme = mongoose.Schema(newsletter)
let subscriptionScheme = mongoose.Schema(subscription)
  //define our models
let UserModel = mongoose.model("user",userScheme)
let BriefModel = mongoose.model("brief",briefScheme)
let ArticleModel = mongoose.model("article",articleScheme)
let NewsletterModel = mongoose.model("newsletter",newsletterScheme)
let SubscriptionModel = mongoose.model("subscription",subscriptionScheme)

let models = {
	UserModel,
	BriefModel,
	ArticleModel,
	NewsletterModel,
	SubscriptionModel
}

module.exports = models

