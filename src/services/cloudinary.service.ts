import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as Cloudinary } from 'cloudinary';
import { CloudinaryFolders } from '../constants/enums';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly cloudinary = Cloudinary;
  private readonly isProduction: boolean;
  constructor(private readonly configService: ConfigService) {
    this.isProduction = !(
      this.configService.getOrThrow<string>('environment') === 'dev'
    );
    this.cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>('cloudinaryCloudName'),
      api_key: this.configService.getOrThrow<string>('cloudinaryApiKey'),
      api_secret: this.configService.getOrThrow<string>('cloudinaryApiSecret'),
      secure: this.isProduction,
    });
  }

  async uploadPatientMedicalReport(
    file: Express.Multer.File,
    patientId: string,
  ) {
    try {
      const uploadResult = await this.cloudinary.uploader.upload(
        file.buffer.toString(),
        {
          folder: `${CloudinaryFolders.BASE_FOLDER}/${CloudinaryFolders.PATIENTS}/${CloudinaryFolders.REPORTS}/${patientId}`,
          resource_type: 'auto',
          use_filename: true,
        },
      );
      this.logger.log(
        `Uploaded medical report result: ${JSON.stringify(uploadResult)}`,
      );
      const url = this.cloudinary.url(uploadResult.public_id, {
        transformation: [
          {
            fetch_format: 'auto',
            quality: 'auto',
          },
        ],
      });

      if (!url)
        throw new Error(
          `Error generating medical report url of patient id: ${patientId}`,
        );

      return url;
    } catch (error) {
      this.logger.error(
        `Failed to upload medical report of patient id: ${patientId}:`,
        error,
      );
      return false;
    }
  }
}
