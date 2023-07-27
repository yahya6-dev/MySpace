//entry point of our application
//we export libs needed for our work
const handlebars = require("express-handlebars")
const express = require("express")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const csurf = require("csurf")
const formidable = require("formidable")
const cors = require("cors")


//set handlebars and its configuration
//our app instance
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

app.get("/test",(req,res) => res.send(["hello"]))
//config cross site request this is for development purpose
app.use(cors({origin:"http://127.0.0.1:3000/*"}))
//allow proxying this is only for development stage
app.enable("trust proxy")
//config static middleware
app.use(express.static(__dirname + "/public"))
app.engine("handlebars",create.engine)
app.set("view engine","handlebars")
app.set("views","./views")
//current instance config credentials
let credentials = require(`./credentials-${app.get("env")}.json`)
//listening port for testing purpose
let port = process.env.PORT || 3033

//config necessary middleware for parsing
//urlencoded data and json, and for using cookies
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieParser(credentials.secretKey))


if (require.name === module) {
   app.listen(port, () => {
   	console.log("server is running")
   })

}

else {
	module.exports = () => app.listen(port,() => console.log("server is running in cluster")) 
}