let nodeMailer = require("nodemailer")
let {auth,secure,host,port} = require("../credentials-development")

//create new instance of nodemailer to send mails
let transport = nodeMailer.createTransport({
  auth,
  host,
  port,
  secure
})

function imageNameToPath() {

}


exports.sendEmail = async function(text,html,to,subject,from) {
    let email = await transport.sendMail({to,from,html,text,subject})
    console.log(email)
}

