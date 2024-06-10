import mongoose from 'mongoose';

export const connectDB = async() => {
    try {
       const {connection} =  await mongoose.connect(process.env.MONGO_URI,{
        dbName: 'udtapatang',
       });

       console.log(`Server connected to Database ${connection.host}`)
    } catch (error) {
        console.log("Some error Occurer",error);
        process.exit(1);
    }
}