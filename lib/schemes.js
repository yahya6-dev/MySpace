let schemes = {
   user:{
   	 username:String,
   	 email:String,
   	 password:String,
   	 lastActivity:String,


   },

   brief:{
   	authorName:String,
   	time:String,
   	articleContent:String,
   	images:[String]
   },
   articles:{
   	email:String
   },

   article:{
   	authorName:String,
   	images:[String],
   	videos:[String],
   	time:String,
   	introduction:String,
   	contents:{
   		sections:[String]

   	}
   }

}

module.exports = schemes