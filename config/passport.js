//const passport=require("passport");
const LocalStrategy=require("passport-local").Strategy;
const mongoose =require("mongoose");
const bcrypt=require("bcryptjs");


//Load User Model
const User=require("../models/User");

module.exports=function(passport){
    passport.use(
        new LocalStrategy({
            usernameField:"email",
            passwordField: 'password'
        },
        (email,password,done)=>{
            //Match User
            User.findOne({email:email})
            .then(user=>{
                if(!user){
                    return done(null,false,{message:"That email isn't found"});
                }
                //Match Password
                bcrypt.compare(password,user.password,(err,isMatch)=>{
                    if(err) throw err;
                    if(isMatch){
                        return done(null,user);
                    }else{
                        return done(null,false,{message:"wrong password"});
                    }
                })
                
            })
            .catch(err=>console.log.og(err));
        }
        )
    );

    passport.serializeUser((user, done) =>{
        done(null, user.id);
      });
      
      passport.deserializeUser((id, done)=> {
        User.findById(id, (err, user)=> {
          done(err, user);
        });
      });

}