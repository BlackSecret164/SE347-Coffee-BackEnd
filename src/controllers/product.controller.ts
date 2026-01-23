import { Controller, Get, Post, Put, Param, Body, Delete, ParseIntPipe, UseGuards, Query, Req } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto, UpdateStatusDto, FilterProductDto } from '../dtos/product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/RoleGuard';
import { Role } from 'src/guards/RoleDecorator';
import { Public } from 'src/guards/PublicDecorator';
import { EnumRoles } from 'src/enums/role.enum';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get('/list')
  @Public()
  @ApiOperation({ summary: 'Get list of products (public access)' })
  findAll(@Req() req: any) {
    const userRole = req.user?.role;
    const userBranchId = req.user?.branchId;
    return this.productService.findAll(userRole, userBranchId);
  }

  @Get('/filter')
  @Public()
  @ApiOperation({ summary: 'Filter products by branch and/or category' })
  filterProducts(@Query() filterDto: FilterProductDto) {
    return this.productService.filterProducts(filterDto);
  }

  @Get('/available-branches/:productId')
  @Public()
  @ApiOperation({ summary: 'Get available branches by product ID' })
  findBranches(@Param('productId', ParseIntPipe) productId: number) {
    return this.productService.findBranchesByProduct(productId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND])
  create(@Body() dto: CreateProductDto, @Req() req: any) {
    const userRole = req.user?.role;
    const userBranchId = req.user?.branchId;
    return this.productService.create(dto, userRole, userBranchId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND])
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductDto,
    @Req() req: any,
  ) {
    const userRole = req.user?.role;
    const userBranchId = req.user?.branchId;
    return this.productService.update(id, dto, userRole, userBranchId);
  }

  @Put('/available/:id')
  @ApiOperation({ summary: 'Update availability of a product' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND])
  updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.productService.updateAvailability(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Role([EnumRoles.ADMIN_SYSTEM, EnumRoles.ADMIN_BRAND])
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userRole = req.user?.role;
    const userBranchId = req.user?.branchId;
    return this.productService.remove(id, userRole, userBranchId);
  }
}
