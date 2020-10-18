const express=require('express');
const expressLayouts=require('express-ejs-layouts');
const mongoose=require("mongoose");
const flash=require("connect-flash");
const session=require("express-session");
const passport=require("passport");
var partials = require("express-partials");
var bodyParser=require("body-parser");

const app=express();

//Passport config
require("./config/passport")(passport);



//DB Connect Mongoose
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true); 
mongoose.connect("mongodb://localhost:27017/LogIn",{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>console.log("MongoDB Is Connected"))
.catch(err=>console.log(err));


//EJS
//app.use(expressLayouts);
app.use(partials());
app.set('view engine','ejs');
app.use(express.static("public"));

//BodyParser
app.use(express.urlencoded({extended:false}));
app.use(bodyParser.urlencoded({extended:true}));

//express Session
app.use(session({
    secret:"secrets",
    resave:true,
    saveUninitialized:true,
}))

//Passport middleWare
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global vars
app.use((req,res,next)=>{
    res.locals.success_msg=req.flash('success_msg');
    res.locals.error_msg=req.flash('error_msg');
    res.locals.error=req.flash('error');
    next();
})

//Routes
app.use('/',require("./routes/index"));
app.use('/users',require('./routes/users'));

const PORT=process.env.PORT ||3000;

app.listen(PORT,console.log("Server is connected on "+PORT));