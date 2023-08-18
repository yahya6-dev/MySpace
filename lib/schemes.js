let schemes = {
   user:{
   	 username:String,
   	 email:String,
   	 password:String,
   	 lastActivity:String,
       isAdmin:Boolean,
       verified:Boolean,
       authorImage:String


   },

   brief:{
      authorImage:String,
      category:String,
      title:String,
      authorName:String,
      time:String,
      articleContent:String,
      images:[String],
      introduction:String, 
      sections:[[String,String,String,String]]
      
   },
   newletter:{
   	email:String
   },

   article:{
      authorImage:String,
      category:String,
      title:String,
   	authorName:String,
   	images:[String],
   	videos:[String],
   	time:String,
   	introduction:String,
   	sections:[[String,String,String,String]]

   	
   },
   subscription:{
      email:String
   }

}

module.exports = schemes