let model = require("./Model") 
const {promisify} = require("util")
const fs = require("fs")
const formidable = require("formidable")
const signed = require("signed")
const {sendEmail} = require("./utils")
const {secretKey} = require("../credentials-development")
//create an instance of signer for signing key
let signer = new signed.Signature({secret:secretKey})

let mkdir = promisify(fs.mkdir)
let rename = promisify(fs.rename)

//index
exports.index  = async (req,res) => res.render("index")
//route to handle user authentication
exports.login = async(req,res) => {
  let form = formidable.formidable()
  form.parse(req,async (error,fields,files) => {
    let email = fields["email"][0]
    console.log(fields)
    let password = fields["password"][0]
    //check to make sure email and password not empty
    if (email.trim() !== "" && password.trim() !== "") {
      let user = await model.UserModel.findOne({email})
      let result = {}
      console.log(email,password,user)
      if (user && user.password === password){
        result.username = user.username
        result.password = user.password
        result.lastActivity = user.lastActivity
        result.email = email
        console.log(req.session)
        res.json({status:"Successfully Login",isAdmin:user.isAdmin || false,result})
      }
      else {
        res.json({status:"Invalid Username or Password "})

      }
    }
    //res.json({status:"Error Fetching User"})

  })
}


exports.sendMail = async (req,res) => {
  let form = formidable.formidable()
  form.parse(req,async (error,fields,files) => {
    let authorName = fields["authorName"][0]
    let mailText = fields["text"][0]
    let user = await model.UserModel.findOne({username:authorName})
    if (user) {
      //await sendEmail(mailText,'',user.email,"Mail from myspace", req.session.email)
          res.send({"status":"sent successfully"})
    }
    else{
      res.json({status:"error"})
    }

  })
} 

//route to handle account verification
exports.verify = async function (req,res) {
  try{
    let location = signer.verify(req.params.email)
    let user = await model.UserModel.findOne({email:location})
    user.updateOne({email:location},{verified:true})
    res.send("verified")
  }
  catch(error) {
    res.send("error")
  }
}

//route to handle user registration
exports.register = async function(req,res) {
  let host = req.headers["host"]
  let form = formidable.formidable()
  form.parse(req,async (error,fields,files) => {
    let username = fields["username"][0]
    let password = fields["password"][0]
    let email = fields["email"][0]

    if (username.trim() !== '' && password.trim() !== '' && email.trim() !== '') {
      let query = await model.UserModel.findOne({email})
      console.log(query)
      if (!query){
        let user = new model.UserModel({username,password,email,isAdmin:false,verified:false})
        user.save()
        //generate signed url
        let host = req.headers.host + "/user/"
        let link = host + signer.sign(email)
        res.render("email",{username,link},async function(err,text) {
          await sendEmail('',text,email,"account verification","yahyasaid, <yahyasaid935@gmail.com>")
          res.json({status:"Account created, check your email to confirm your account "}) 
        })

      }
      else{
        res.json({status:"Email already in use"})
      }
    }
    else {
      res.json({status:"check your email and password"})
    }
  })
}



//route to handle logout
exports.logout = async (req,res) => {
  let email = req.session.email 
  let user = await model.UserModel.findOne({email})
  if (user){ 
    await model.UserModel.updateOne({email},{lastActivity:new Date().toTimeString()})
    delete req.session.username
    delete req.session.password
    delete req.session.email
    delete req.session.lastActivity
    res.json({status:"Logout Successfully"})
  }
  else
    res.json({status:"Error UnAuthorized"})
}

exports.subscribe = (req,res) => {
  let regexp = /[a-zA-Z0-9]+@[a-zA-Z0-9]+\.(org | com | net |)/
  let form = formidable.formidable()
  form.parse(req,(err,fields,files) => {
    console.log(fields)
    if (regexp.test(fields.email[0])) {
      let subscription = new model.SubscriptionModel()
      subscription.email = fields.email[0]
      subscription.save()
      res.json({response:"Thanks to you for subscribing"})
    }
    else
      res.json({response:"error while subscribing"})
  
  })

  
} 

//for searching content
exports.search = async (req,res) => {
  let form = formidable.formidable()
  form.parse(req,async (error,fields,files) => {
    let articles = await model.ArticleModel.find({category:fields["search"][0]})
    console.log(articles,"I Look at")
    res.json(articles.map(e => ({
      title:e.title,
      introduction:e.sections[0][0]
    })
  )
  
 )
 })
  
}
async function userExists(email,password){
  let user = await model.UserModel.findOne({email})
  if (user && user.password === password){
    return user
  }
  else
    return null

}

exports.upload = (req,res) => {
	let form = formidable.formidable()
	form.parse(req,(err,fields,files) => {
		console.log(files.upload[0].originalFilename)
  		let oldPath = files.upload[0].filepath
  		let newPath = "./public/"+files.upload[0].originalFilename
  		rename(oldPath,newPath)
  		res.json({status:"ok"})
	}) 
  	
}

//this route for retrieving article
exports.article = async (req,res) => {
  let article = req.params.article.replace(/-+/g,' ')
  article = article.split(" ").map(e => e[0].toUpperCase() + e.slice(1)).join(" ")
  console.log(article)
  let result = await model.ArticleModel.findOne({title:article})
  if (!result) {
    result = await model.BriefModel.findOne({title:article})
  }
  if (!result) {
    res.json({title:"No Such Article"})
    return 
  }
  //mapped the article to the expected format
  let mappedArticle = {}
  mappedArticle.category = result.category
  mappedArticle.title = result.title
  mappedArticle.authorImage = result.authorImage
  mappedArticle.authorName = result.authorName || "yahyasaid"
  mappedArticle.lastActivity = result.lastActivity || new Date().toLocaleTimeString()
  mappedArticle.introduction = result.sections[0][0]
  mappedArticle.codes = result.sections[0][2]
  console.log(mappedArticle)
  delete result.sections[0]
  mappedArticle.sections = result.sections.slice(1)
  res.json(mappedArticle)
}

exports.briefs = async (req,res) => {
  let results = await model.BriefModel.find()
  //send the result as a formatted json
  res.json(results.map(e => ({
    authorName:e.authorName || "Yahya Said",
    introduction:e.sections[0][0],
    time:e.time,
    title:e.title,
    codes:e.sections[0][2]
  })))
}

//send articles route
exports.articles =  async (req,res) => {
   let results = await model.ArticleModel.find()
   res.json(
     results.map(e => ({
      authorName:e.authorName || "osprey",
      introduction:e.sections[0][0],
      time:e.time,
      title:e.title,
      codes:e.sections[0][2]
     }))
    )
}

exports.admin = (req,res) => {
  //this one for receiving new article data as a post
  //request
  let form =   formidable.formidable()
  form.parse(req,async (error,fields,files) => {
  	//fill the rest
    let password = fields.password[0]
    let email = fields.email[0]
    let author = await userExists(email,password)
    if (author) {


    console.log(author,"is this loaded")
  	let maxcontent = parseInt(fields["maxcontent"])
  	console.log("received maxcontent " + maxcontent )
    let article 
    if (fields.location[0] == "/admin-brief")
      article = new model.BriefModel()
    else
  	 article = new model.ArticleModel()
  	//article.title = fields.title
    article.title = fields.title[0]
    article.authorName = author.username
    article.authorImage = author.authorImage
    console.log(article.authorImage)
	  console.log(fields, fields.location[0])
  	//parse the content save them to db
    let sections = []
  	let section,title
  	for (let i=0; i < maxcontent; ++i) {
  		let sectionKey = `section${i}`
  		let titleKey = `section${i}-title`
      let content = JSON.parse(fields[sectionKey][0])
      console.log(content,"content")
      let section = content[0]
      let codes = content[1]
  		title = fields[titleKey][0]
      let time = content[2]
      console.log(codes,section,"are u not aware of the change")
      sections.push([section,title,JSON.stringify(codes),time])
  	}

    article.sections = sections

  	let images = []
  	article.images = images
    article.time = fields.time[0]
    article.category = fields["category"][0]
  	article.save()
  	res.json({status:"Your article was successfully uploaded"})
    }
 else
  res.json({status:"Error Log in please"})

  })
}



