import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 4000,
  mongodbUri: process.env.DB_URI || "mongodb://localhost:27017/ShopJose",
  jwtSecret: process.env.JWT_SECRET || "DelUnoal6",
  jwtExpires: process.env.JWT_EXPIRES || "30d",
  adminEmail: process.env.ADMIN_EMAIL || "adminEmail@gmail.com",
  adminPassword: process.env.ADMIN_PASSWORD || "adminPassword123",
  emailUser: process.env.EMAIL_USER || "antonysanz06@gmail.com",
  emailPass: process.env.EMAIL_PASS || "ogsd teib uzur ylcc",
  nodeEnv: process.env.NODE_ENV || "development",
  
  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  }
};

export default config;