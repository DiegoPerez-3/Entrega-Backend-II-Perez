import mongoose from 'mongoose';

const passworResetSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  token:{
    type:String,
    required:true
  },
  expiresAt:{
    type:Date,
    required:true,
    expires:0
  }
});

export default mongoose.model('PassworReset', passworResetSchema);
