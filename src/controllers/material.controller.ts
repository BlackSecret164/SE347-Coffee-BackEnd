import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { RawMaterialService } from '../services/material.service';
import { RawMaterialDto } from '../dtos/rawmaterial.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Raw Materials')
@Controller('material')
export class RawMaterialController {
  constructor(private readonly rawMaterialService: RawMaterialService) {}

  @Get('/list')
  @ApiOperation({ summary: 'Get all raw materials' })
  @ApiResponse({ status: 200, description: 'List of all raw materials' })
  async findAll(@Res() res) {
    const result = await this.rawMaterialService.findAll();
    return res.status(HttpStatus.OK).json(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get raw material by ID' })
  @ApiResponse({ status: 200, description: 'Raw material found' })
  async findOne(@Param('id') id: number) {
    return this.rawMaterialService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new raw material' })
  @ApiResponse({ status: 201, description: 'Raw material created' })
  async create(@Body() rawMaterialDto: RawMaterialDto) {
    return this.rawMaterialService.create(rawMaterialDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update raw material by ID' })
  @ApiResponse({ status: 200, description: 'Raw material updated' })
  async update(@Param('id') id: number, @Body() rawMaterialDto: RawMaterialDto) {
    return this.rawMaterialService.update(id, rawMaterialDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a raw material by ID' })
  @ApiResponse({ status: 204, description: 'Raw material deleted' })
  async remove(@Param('id') id: number) {
    await this.rawMaterialService.remove(id);
    return { message: 'Material deleted' };
  }
}
