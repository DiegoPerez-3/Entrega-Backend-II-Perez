import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        default:""
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    stock:{
        type:Number,
        default:0,
        min:0
    },
    thumbnail:{
        type:String,
        default:""
    },
    category:{
        type:String,
        default:""
    }
})

export default mongoose.model("Product",productSchema)