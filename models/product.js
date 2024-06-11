import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    name:{
        type: String,
        required:[ true, "Please provide name"],
    },
    description:{
        type: String,
        required:[ true, "Please provide description"],
    },
    price:{
        type: Number,
        required:[ true, "Please provide price"],
    },
    stock: {
        type: Number,
        required: [true, "Please provide stock"],
    },
    images:[
        {
            public_id: String,
            url: String
        }
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    created_at: {
        type:Date,
        default: Date.now,
    }
})

export const Product = mongoose.model("Product",schema);