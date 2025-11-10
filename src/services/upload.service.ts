import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class FileService {
  async uploadImageToCloudinary(file: Express.Multer.File): Promise<{ message: string; imageUrl: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    try {
      const formData = new FormData();
      formData.append('file', file.buffer, file.originalname);
      formData.append('upload_preset', 'upload-coffeewfen');
      formData.append('folder', 'doan');

      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dkntmdcja/image/upload',
        formData,
        {
          headers: formData.getHeaders(),
        },
      );

      const data = response.data as { secure_url: string };

      return {
        message: 'File uploaded successfully',
        imageUrl: data.secure_url,
      };
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }
}
