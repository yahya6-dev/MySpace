//entry point of our application
//we export libs needed for our work
const handlebars = require("express-handlebars")
const express = require("express")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const csurf = require("csurf")
const formidable = require("formidable")
const cors = require("cors")
const handlers = require("./lib/handlers")
const expressSession = require("express-session")
const helmet = require("helmet")
//set handlebars and its configuration
//our app instance
let model = require("./lib/Model")
let app = express()

let create = handlebars.create({
 helpers:{
 	section:function(name,options) {
 		if (!this._sections) this._sections = {}
 		this._sections[name] = options.fn(this)
 	    return null
 	}
 }

})


//allow proxying this is only for development stage
app.enable("trust proxy")
//config static middleware
app.use("/static",express.static(__dirname + "/public"))
app.engine("handlebars",create.engine)
app.set("view engine","handlebars")
app.set("views","./views")
app.use(helmet({
	xContentTypeOptions:false,
	contentSecurityPolicy:{
		directives:{},
		reportOnly:true
	}
}))
//current instance config credentials
let credentials = require(`./credentials-${app.get("env")}.json`)
//config necessary middleware for parsing
//urlencoded data and json, and for using cookies
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieParser(credentials.secretKey))
app.use(expressSession({
	resave:false,
	saveUninitialized:false,
	secret:credentials.secretKey

}))


//init db 
//app.use(bodyParser.urlencoded(extended:false))
const db = require("./lib/db")(app.get("env"))
if (app.get("env") === "production"){
	model.UserModel({
		username:"YahyaSaid",
		email:"yahyasaid935@gmail.com",
		password:"hornet",
		authorImage:"site-author.png",
		lastActivity:"2hours",
		isAdmin:true,
		verified:true
	}).save()
}
//route for sending mail
app.post("/api/sendmail",handlers.sendMail)
app.get("/",handlers.index)
//add registration route
app.get("/api/verify/:user",handlers.verify)
app.post("/api/register",handlers.register)
app.post("/api/admin-upload",handlers.admin)
//image upload route
app.post("/api/upload-image",handlers.upload)
app.post("/api/login",handlers.login)
//logout route
app.get("/api/logout",handlers.logout)
app.get("/api/briefs",handlers.briefs)
app.get("/api/articles",handlers.articles)
app.get("/api/article/:article",handlers.article)
app.post("/api/search",handlers.search)
//route for handling newsletter subscription
app.post("/api/subscription",handlers.subscribe)
//config cross site request this is for development purpose
//app.use(cors())
//listening port for testing purpose
let port = process.env.PORT || 4000



if (require.name === module) {
   app.listen(port, () => {
   	console.log("server is running")
   })

}

else {
	module.exports = () => app.listen(port,() => console.log("server is running in cluster")) 
}
