import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("Connected to Database Successfully", connectionInstance.connection.host)
    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
        throw error
    }
}

export default connectDB;