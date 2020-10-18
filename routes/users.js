const express=require('express')
const router=require("express").Router();
const User=require("../models/User");
const bcrypt=require("bcryptjs");
const passport=require("passport");
const Product = require("../models/Product");
const { createRequireFromPath } = require("module");

router.get('/login',(req,res)=>{
    if(!req.isAuthenticated()){
        res.render("Login");
    }else{
        res.redirect("/browse");
    }
    
});

router.get('/register',(req,res)=>{
    if(!req.isAuthenticated()){
        res.render("Signup");
    }else{
        res.redirect("/browse");
    }
});

router.post('/register',(req,res)=>{
    const {name,email,password,password2}=req.body;
    let errors=[];

    //Check required fields
    if(!name || !email || !password || !password2){
        errors.push({msg:"Please Fill In All Fields"});
    }
    //Check password match
    if(password !==password2){
        errors.push({msg:"Passwords don't match"});
    }
    //Check pass length
    if(password.length<6){
        errors.push({msg:"Password should be at least 7 characters"});
    }

    if(errors.length>0){
        res.render("Signup",{
            errors,
            name,
            email,
            password,
            password2,
        });
    }else{
        User.findOne({email:email})
        .then(user =>{
            if(user){
                //User exists
                errors.push({msg:"User E-mail Already Exists"});
                res.render("Signup",{
                    errors,
                    name,
                    email,
                    password,
                    password2,
                });
            }else{
                const newUser=new User({
                    name,
                    email,
                    password,
                })
                bcrypt.genSalt(10,(err,salt)=>
                   bcrypt.hash(newUser.password,salt,(err,hash)=>{
                       if(err) throw err;
                       //Set pass to hashed
                       newUser.password=hash;
                       //Saving user
                       newUser.save()
                       .then(user=>{
                           req.flash("success_msg","You are now registered and can log in");
                           res.redirect("/users/login");
                       })
                       .catch(err=>console.log(err))
                }))
            }
        });
    }
});


//Login Handle
router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect:"/browse",
        failureRedirect:"/users/login",
        failureFlash:true 
    })(req,res,next);
});

//Logout Handle
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash("success_msg","You are logged out");
    res.redirect("/users/login");
})

//Likes list Handle
router.get('/likes',(req,res)=>{
    if(req.isAuthenticated()){
        let likedListID=[];
    let likedListProducts=[];
    var k=0;
    function add(){
        Product.find({_id:likedListID[k]},(err,result)=>{
            if(result[0]){likedListProducts.push(result[0]);}
            k++;
            if(k<likedListID.length){
                return add();
            }else{
                res.render("Likes",{PRODUCT:likedListProducts});
            }
        })
    }
    User.find({_id:req.user._id},(err,results)=>{
        if(err){
            console.log(err);
            req.flash("error_msg","Something went wrong please try again later");
            res.redirect("/browse");
        }else{
            if(results[0].likes.length===0){
                req.flash("error_msg","Your WishList Is Empty Now");
                res.redirect("/browse");
            }
            for(var i=0;i<results[0].likes.length;i++){
                likedListID.push(results[0].likes[i]);
            }
            add();
        }
    })
    }else{
        let errors=[];
        errors.push({msg:"Please Register Or Login First To View This Page"});
        res.render("Signup",{errors});
    }
})

//Cart list Handle
//Likes list Handle
router.get('/cart',(req,res)=>{
    if(req.isAuthenticated()){
        let cartListID=[];
    let cartListProducts=[];
    var k=0;
    function add(){
        Product.find({_id:cartListID[k]},(err,result)=>{
            if(result[0]){cartListProducts.push(result[0]);}
            k++;
            if(k<cartListID.length){
                return add();
            }
            if(k==cartListID.length){
                res.render("Cart",{PRODUCT:cartListProducts});
            }
        })
    }
    User.find({_id:req.user._id},(err,results)=>{
        if(err){
            console.log(err);
            req.flash("error_msg","Something went wrong please try again later");
            res.redirect("/browse");
        }else{
            if(results[0].cart.length===0){
                req.flash("error_msg","Your Cart Is Empty Now");
                res.redirect("/browse");
            }
            for(var i=0;i<results[0].cart.length;i++){
                cartListID.push(results[0].cart[i]);
            }
            add();
        }
    })
    }else{
        let errors=[];
        errors.push({msg:"Please Register Or Login First To View This Page"});
        res.render("Signup",{errors});
    }
})


module.exports=router;