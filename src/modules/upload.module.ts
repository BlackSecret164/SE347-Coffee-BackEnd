import { Module } from '@nestjs/common';
import { FileController } from '../controllers/upload.controller';
import { FileService } from '../services/upload.service';

@Module({
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
