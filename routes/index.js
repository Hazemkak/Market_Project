const express=require('express')
const router=require("express").Router();
const {ensureAuthenticated}=require('../config/auth');
const Product=require("../models/Product");
const User = require('../models/User');

//Home Handling
router.get('/',(req,res)=>{
    const Header=req.isAuthenticated() ? "partials/AccHeader.ejs" : "partials/Header.ejs";
    res.render("Home",{HEADER:Header});
});

//Offers Handling
router.get("/offers",(req,res)=>{
    const Header=req.isAuthenticated() ? "partials/AccHeader.ejs" : "partials/Header.ejs";
    res.render("Offers",{HEADER:Header});
})

//Contact Handling
router.get("/contact",(req,res)=>{
    const Header=req.isAuthenticated() ? "partials/AccHeader.ejs" : "partials/Header.ejs";
    res.render("Contact",{HEADER:Header});
})

//Browse Handling
router.get("/browse",(req,res)=>{
    if(req.isAuthenticated()){
    Product.find({},(err,results)=> {
        if(err){
            console.log(err);
            res.redirect('/');
        }
        else{
            res.render("Browse",{
                PRODUCT:results
            });
        }
    });
    }else{
        let errors=[];
            errors.push({msg:"Please Register Or Login First To View This Page"});
            res.render("Signup",{errors});
    }
});

//Product view handling
router.get("/products/:viewProducts",(req,res)=>{
    let view=req.params.viewProducts;
    if(req.isAuthenticated()){
        Product.find({_id:view},(err,results)=>{
            if(err){
                console.log(err);
                res.redirect("/browse");
            }
            else if(results){
                res.render("ProductView",{PRODUCT:results});
            }else{
                res.send("Product Isn't Available Anymore In The Market");
            }
        });
    }else{
        let errors=[];
        errors.push({msg:"Please Register Or Login First To View This Page"});
        res.render("Signup",{errors});
    }
    
})

//Handling Checkout
router.get("/checkout/:checkoutProduct",(req,res)=>{
    let checkout=req.params.checkoutProduct;
    if(req.isAuthenticated()){
        Product.find({_id:checkout},(err,results)=>{
            if(err){
                console.log(err);
                res.redirect("/products/"+checkout);
            }else if(results){
                res.render("Checkout",{PRODUCT:results});
            }else{
                res.send("Product Isn't Available Anymore In The Market");
            }
        });
    }else{
        let errors=[];
        errors.push({msg:"Please Register Or Login First To View This Page"});
        res.render("Signup",{errors});
    }
})

//Handling Checkout Continue
router.post("/checkout/:checkoutProduct",(req,res)=>{
    let checkout=req.params.checkoutProduct;
    if(req.isAuthenticated()){
        Product.find({_id:checkout},(err,results)=>{
            if(err){
                console.log(err);
                res.redirect("/checkout/"+checkout);
            }else if(results){
                res.redirect("/products/"+checkout);
            }
        });
    }else{
        let errors=[];
        errors.push({msg:"Please Register Or Login First To View This Page"});
        res.render("Signup",{errors});
    }
})

//Handling Cart Add
router.get("/cart/:productAdded",(req,res)=>{
    if(req.isAuthenticated()){
        var alreadyIn=false;
        let product=req.params.productAdded;
    var productCart=[];
    const filter={_id:req.user._id};
    //Making sure that item isn't already added
    User.find(filter,(err,results)=>{
        if(err){console.log(err);}
        else{
            for(var i=0;i<results[0].cart.length;i++){
                if(results[0].cart[i]===product){
                    alreadyIn=true;
                }
            }
        }
        //Checking if already added or not to make the suitable action
        if(!alreadyIn){
            User.find(filter,(err,results)=>{
                if(err){console.log(err);}
                else{
                   for(var i=0;i<results[0].cart.length;i++){
                       productCart.push(results[0].cart[i]);
                   }
                   //Adding the new product to cart
                   productCart.push(product);
                   const update={cart:productCart};
                   User.updateOne(filter,update,function(err){
                       if(err){console.log(err);}
                       else{console.log("Cart List Updated successfully");}
                    });
                }
            });
            req.flash("success_msg","Added To Your Cart Successfully");}
        else{
            req.flash("error_msg","Item Is Already Added To Your Cart");
        }
        res.redirect("/products/"+product);
    })
    }else{
        let errors=[];
        errors.push({msg:"Please Register Or Login First To View This Page"});
        res.render("Signup",{errors});
    }
});

//Handling Likes Add
router.get("/likes/:productAdded",(req,res)=>{
    if(req.isAuthenticated()){
        let product=req.params.productAdded;
        var productLikes=[];
        const filter={_id:req.user._id};
        var alreadyIn=false;

        //Making sure that item isn't already added
        User.find(filter,(err,results)=>{
            if(err){console.log(err);}
            else{
                for(var i=0;i<results[0].likes.length;i++){
                    if(results[0].likes[i]===product){
                        alreadyIn=true;
                    }
                }
            }
            if(!alreadyIn){
                User.find(filter,(err,results)=>{
                    if(err){console.log(err);}
                    else{
                        for(var i=0;i<results[0].likes.length;i++){
                        productLikes.push(results[0].likes[i]);
                       }
                       //Adding the new product to Likes
                       productLikes.push(product);
                       const update={likes:productLikes};
                       User.updateOne(filter,update,function(err){
                           if(err){console.log(err);}
                          else{console.log("Likes List Updated successfully");}
                        });
                    }
                });
        
                req.flash("success_msg","Added To Your WishList Successfully");}
            else{
                req.flash("error_msg","Item Is Already Added To Your WishList");
            }
            res.redirect("/products/"+product);
        });
        
        
        }else{
            let errors=[];
            errors.push({msg:"Please Register Or Login First To View This Page"});
            res.render("Signup",{errors});
        }
})

//Handling Remove from cart
router.get("/delete/cart/:deleted",(req,res)=>{
    const deletedItem=req.params.deleted;
    let newCart=[];

    User.find({_id:req.user._id},(err,results)=>{
        if(err){
            console.log(err);
            req.flash("error_msg","Failed To Remove Item From Cart , Please Try Again Later !");
            res.redirect("/users/cart");
        }else{
            newCart=results[0].cart;
            newCart.splice(newCart.indexOf(deletedItem),1);
            User.findOneAndUpdate({_id:req.user._id},{cart:newCart},(err,result,respond)=>{
                if(err){console.log(err)}
                else{
                    if(newCart.length!==0){
                        req.flash("success_msg","Item Is Removed Successfully"); 
                    }
                    res.redirect("/users/cart");
                }
            });
        }
    })
})

//Handling remove from likes
router.get("/delete/likes/:deleted",(req,res)=>{
    const deletedItem=req.params.deleted;
    let oldList=[];

    User.find({_id:req.user._id},(err,results)=>{
        if(err){
            console.log(err);
            req.flash("error_msg","Failed To Remove Item From Cart , Please Try Again Later !");
            res.redirect("/users/likes");
        }else{
            oldList=results[0].likes;
            oldList.splice(oldList.indexOf(deletedItem),1);
            User.findOneAndUpdate({_id:req.user._id},{likes:oldList},(err,result,respond)=>{
                if(err){console.log(err)}
                else{
                    if(oldList.length!==0){
                        req.flash("success_msg","Item Is Removed Successfully");
                    }
                    res.redirect("/users/likes");
                }
            });
        }
    })
})




module.exports=router;