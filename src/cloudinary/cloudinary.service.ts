import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from 'src/config/config.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
    constructor(
        private readonly configService: ConfigService,
    ) {
        cloudinary.config({
            cloud_name: this.configService.getCloudinaryCloudName(),
            api_key: this.configService.getCloudinaryApiKey(),
            api_secret: this.configService.getCloudinaryApiSecret(),
        });
    }


    // Upload Iamge To Cloudinary
    async uploadImage(buffer: Buffer, folder: string = 'students'): Promise<string> {
        try {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: folder,
                        resource_type: 'image',
                        transformation: [
                            { width: 500, height: 500, crop: 'fill' },
                            { quality: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (error || !result) {
                            reject(error || new Error('No result returned from Cloudinary'));
                        } else {
                            resolve(result.secure_url);
                        }
                    }
                );

                const readableStream = Readable.from(buffer);
                readableStream.pipe(uploadStream);
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to upload image to Cloudinary');
        }
    }


    // Delete Image
    async deleteImage(imageUrl: string): Promise<void> {
        try {
            const publicId = this.extractPublicId(imageUrl);
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            throw new InternalServerErrorException('Failed to delete image from Cloudinary');
        }
    }


    // Extract PublicId
    private extractPublicId(imageUrl: string): string {
        const parts = imageUrl.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];
        const folder = parts[parts.length - 2];
        return `${folder}/${publicId}`;
    }
}