import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    frontend_url: process.env.FRONTEND_URL,
    bcrypt_saltRounds: Number(process.env.BCRYPT_SALTROUNDS || '12'),
    super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
    super_admin_email: process.env.SUPER_ADMIN_EMAIL,
    super_admin_name: process.env.SUPER_ADMIN_NAME,
    super_admin_phone: process.env.SUPER_ADMIN_PHONE,
    jwt: {
        access_secret: process.env.JWT_ACCESS_SECRET,
        refresh_secret: process.env.JWT_REFRESH_SECRET,
        access_expiry: process.env.JWT_ACCESS_EXPIRY,
        refresh_expiry: process.env.JWT_REFRESH_EXPIRY,
    },
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM,
        from_name: process.env.EMAIL_FROM_NAME,
    },
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    },
    openai_api_key: process.env.OPENAI_API_KEY,
}


