const mongoose=require("mongoose");

const productSchema=new mongoose.Schema({
    name:String,
    type:String,
    description:String,
    company:String,
    price:Number,
    image:String,
    facts:{
        num_serving:Number,
        weight_serving:Number,
        calories:Number,
        total_fat:Number,
        total_carb:Number,
        protein:Number,
    },
});

const Product=mongoose.model('Product',productSchema);

module.exports=Product;