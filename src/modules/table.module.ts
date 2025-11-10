import { Module } from '@nestjs/common';
import { TableService } from '../services/table.service';
import { TableController } from '../controllers/table.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from '../entities/tables.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Table])],
  providers: [TableService],
  controllers: [TableController],
})
export class TableModule {}
