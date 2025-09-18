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
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          asset_folder: `${CloudinaryFolders.BASE_FOLDER}/${CloudinaryFolders.PATIENTS}/${CloudinaryFolders.REPORTS}/${patientId}`,
          public_id: `${patientId}-${Date.now()}`,
          display_name: file.originalname,
        },
      );

      this.logger.log(
        `Uploaded medical report result: ${JSON.stringify(uploadResult)}`,
      );

      return { publicId: uploadResult.public_id, url: uploadResult.secure_url };
    } catch (error) {
      this.logger.error(
        `Failed to upload medical report of patient id: ${patientId}:`,
        error,
      );
      return false;
    }
  }

  async deletePatientMedicalReport(publicId: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const deletionResult = await this.cloudinary.uploader.destroy(publicId);

      this.logger.log(
        `Deleting medical report of public id: ${publicId} \nresult: ${JSON.stringify(deletionResult)}`,
      );

      return deletionResult !== undefined;
    } catch (error) {
      this.logger.error('Failed to delete patient medical report', error);
      return false;
    }
  }
}
