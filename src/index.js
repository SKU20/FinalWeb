const express = require('express')
const multer = require("multer")
const app = express()
const path=require("path")
const async = require('hbs/lib/async')
const { collection, productCollection } = require("./mongodb");
const { ObjectId } = require("mongodb"); 
const { cp } = require('fs')

const tempelatePath = path.join(__dirname,'../tempelates')


app.use(express.json())
app.set("view engine","ejs")
app.set("views",tempelatePath)
app.use(express.urlencoded({extended:false}))
app.use('/uploads', express.static('uploads'));
app.get("/", (req,res)=>{
  res.render("login", { error: null })
})
app.get("/home", async (req,res) => {
  const email = req.body;
  
  const user = await collection.findOne(email);

  if(!user){
    res.render("/login",{error:null})
  }
  const data = {
    name:user.name,
    lastname:user.lastname,
    email:user.email,
    phone:user.phone,
    password:user.password,
    date:user.date
}
const products = await productCollection.find({}).exec();
res.render("home",{data,products});
})


app.get("/signup", (req,res)=>{
    res.render("signup", { error: null })
})
//Passing data for edit
app.get("/edit_product/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await productCollection.findOne({ _id: new ObjectId(productId) });
    const info = {
      _id:product._id,
      name: product.name,
      description: product.description,
      price: product.price
    };
    res.render("edit_product", { info });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred.');
  }
});
//Passing da data for profile
app.post("/home", async (req,res)=>{
  const data = {
    name:req.body.name,
    lastname:req.body.lastname,
    email:req.body.email,
    phone:req.body.phone,
    password:req.body.password,
    date:req.body.date
}
const products = await productCollection.find({}).exec();
 res.render("home",{data,products});
})
//Sign up
app.post("/signup",async (req,res)=>{
     const {email} = req.body;
  try{
    const user = await collection.findOne({ email });
    
     if(user){
        error_msg="Email is already used";
        return res.render("signup",{error: error_msg})
     }
    else{
     const data={
        name:req.body.name,
        lastname:req.body.lastname,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password,
        date:req.body.date
     }

   await collection.insertMany([data])
    
   res.render("login", {data,error:null});
    }
  }catch(error){
    console.error('Error:', error);
  }
})
//Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await collection.findOne({ email });
  
  if (!user) {
    return res.render("login", { error: "Invalid email or password." });
  }

  if (user.email === "lukalevidze@yahoo.com" && user.password === "Luka1964") {
    try {
      const products = await productCollection.find({}).exec();
      return res.render('admin', { products });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).send('An error occurred.');
    }
  }

  if (user.password !== password) {
    return res.render("login", { error: "Invalid email or password." });
  }

  const data = {
    name: user.name,
    lastname: user.lastname,
    email: user.email,
    phone: user.phone,
    password: user.password,
    date: user.date
  };
  const products = await productCollection.find({}).exec();
  res.render("home", { data: data, products: products });
});
//User profile
app.post("/profile", async (req,res) => {
  const data = {
      name:req.body.name,
      lastname:req.body.lastname,
      email:req.body.email,
      phone:req.body.phone,
      password:req.body.password,
      date:req.body.date
  }
   res.render("profile",data);
});

//Product image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    cb(null, originalName);
  }
  
});

const upload = multer({ storage: storage });
//product upload
app.post("/upload", upload.single("photo"), async (req, res) => {
  const info = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    photo: req.file.originalname 
  };

  await productCollection.insertMany([info]);

  try {
    const products = await productCollection.find({}).exec();
    res.render('admin', { products });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred.');
  }
});
//edit
app.post("/update", async (req, res) => {
  const productId =req.body.id
  const updatedData = {
    name: req.body.editName, 
    description: req.body.editDescription, 
    price: req.body.editPrice  
  };

  try {
    await productCollection.updateOne(
      { _id: productId }, 
      { $set: updatedData }
    ); 
    const products = await productCollection.find({}).exec();
    res.render("admin", { products });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred.');
  }
});
app.get("/delete/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await productCollection.deleteOne({ _id: new ObjectId(productId) });
    const products = await productCollection.find({}).exec();
    res.render("admin",{products});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred.');
  }
});

app.get("/details/:productId", async (req,res) => {
  const productId = req.params.productId;
  const product = await productCollection.findOne({ _id: new ObjectId(productId) });

  const user = req.body.email;
  const info = await collection.findOne(user);
  const prodInfo ={
    name:product.name,
    description:product.description,
    price:product.price, 
    photo:product.photo
  }
  const infor = {
    name:info.name,
    lastname:info.lastname,
    email:info.email,
    phone:info.phone,
    password:info.password,
    date:info.date
}
    res.render("details",{infor,prodInfo});
});

app.post("/logout", async (req,res) =>{
  const email = req.body;

  const user = await collection.findOne(email);
  const error = "";
  if(!user){
   error = "Invalid email or password"
  }

  res.render("login",{error});
})

app.listen(3001,()=>{
    console.log("prot Connected")
})