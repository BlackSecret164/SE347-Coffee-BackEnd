import {
  Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Req
} from '@nestjs/common';
import { Request } from 'express';
import { TableService } from '../services/table.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TableDto } from '../dtos/tables.dto';
import { Table } from '../entities/tables.entity';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/RoleGuard';
import { Role } from 'src/guards/RoleDecorator';
import { EnumRoles } from 'src/enums/role.enum';

@ApiTags('Table')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Role([EnumRoles.ADMIN_BRAND, EnumRoles.STAFF])
@Controller('table')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get('/list')
  @ApiOperation({ summary: 'Get list of tables' })
  @ApiResponse({ status: 200, type: [Table] })
  findAll(@Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.tableService.findAll(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get table by ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.tableService.findOne(id, branchId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new table' })
  create(@Body() tableDto: TableDto, @Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.tableService.create(tableDto, branchId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update table by ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() tableDto: TableDto,
    @Req() req: Request,
  ) {
    const branchId = req.user['branchId'];
    return this.tableService.update(id, tableDto, branchId);
  }

  @Put('/complete/:id')
  @ApiOperation({ summary: 'Reset/Complete table by ID' })
  complete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.tableService.completeTable(id, branchId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete table by ID' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const branchId = req.user['branchId'];
    return this.tableService.remove(id, branchId);
  }
}
