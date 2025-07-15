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

    getJWTExpiresIn(){
        return this.getValue("JWT_EXPIRES_IN");
    }

    REDIS_HOST
    REDIS_PORT
    REDIS_PASSWORD

}