import * as dotenv from "dotenv";

export class ConfigService {

    constructor() {
        dotenv.config({
            path: `.env`,
        });
    }

    private getValue(key: string, throwOnMissing = true): string {
        const value = process.env[key];
        if (!value && throwOnMissing) {
            throw new Error(`config error - missing environment variable: ${key}`);
        }

        return value || '';
    }

    getPort() {
        return this.getValue("PORT", true);
    }

    getFrontEndBaseUrl1() {
        return this.getValue("FRONT_END_BASE_URL_1", true);
    }

    getFrontEndBaseUrl2() {
        return this.getValue("FRONT_END_BASE_URL_2", true);
    }

    getMongoDbUri() {
        return this.getValue("MONGODB_URI");
    }

    getJWTSecretKey() {
        return this.getValue("JWT_SECRET_KEY");
    }

    getJWTExpiresIn() {
        return this.getValue("JWT_EXPIRES_IN");
    }

    getRedisHost() {
        return this.getValue("REDIS_HOST", true);
    }

    getRedisPort() {
        return this.getValue("REDIS_PORT", true);
    }

    getRedisPassword() {
        return this.getValue("REDIS_PASSWORD", true);
    }

    getJwtRefreshSecretKey() {
        return this.getValue("JWT_REFRESH_SECRET_KEY", true);
    }

    getJwtRefreshExpiry() {
        return this.getValue("JWT_REFRESH_EXPIRY_IN", true);
    }

    getInitialAdminEmail() {
        return this.getValue("INITIAL_ADMIN_EMAIL", true);
    }

    getInitialAdminPassword() {
        return this.getValue("INITIAL_ADMIN_PASSWORD", true);
    }

    getCloudinaryCloudName() {
        return this.getValue("CLOUDINARY_CLOUD_NAME", true);
    }

    getCloudinaryApiKey() {
        return this.getValue("CLOUDINARY_API_KEY", true);
    }

    getCloudinaryApiSecret() {
        return this.getValue("CLOUDINARY_API_SECRET", true);
    }

    getHMSApiUrl() {
        return this.getValue("HMS_API_URL", true);
    }

    getHMSAppAccessKey() {
        return this.getValue("HMS_APP_ACCESS_KEY", true);
    }

    getHMSAppSecretKey() {
        return this.getValue("HMS_APP_SECRET", true);
    }

    getHMSTemplateId() {
        return this.getValue("HMS_TEMPLATE_ID", true);
    }

}