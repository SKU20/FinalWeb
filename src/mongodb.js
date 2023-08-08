const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://mate2003:Mate2003@finalweb.idhlajf.mongodb.net/userInformation")
.then(()=>{
    console.log("mongodb Connected")
})
.catch((err)=>{
    console.log(err)
})

const LogInSchema = new mongoose.Schema({
    name:{
        type:String,
        rquired:true
    },
    lastname:{
        type:String,
        rquired:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        rquired:true
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:String,
        rquired:true
    }
})
const productSchema = new mongoose.Schema({
    ID:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        rquired:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    photo:{
        type:String,
        rquired:true
    }
})

const collection = new mongoose.model("LoginInfo",LogInSchema)
const productCollection = new mongoose.model("products",productSchema)

const Product = mongoose.model('Product', productSchema); // Define the Product model

module.exports = ({collection,productCollection});