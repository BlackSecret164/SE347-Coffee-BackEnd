import { Controller, Post, Body, Get, Param, Put, Delete, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { RatingService } from '../services/rating.service';
import { CreateRatingDto, UpdateRatingDto } from '../dtos/rating.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/RoleGuard';
import { Role } from 'src/guards/RoleDecorator';
import { EnumRoles } from 'src/enums/role.enum';

@ApiTags('Rating')
@Controller('ratings')
export class RatingController {
    constructor(private readonly ratingService: RatingService) { }

    @Post()
    @ApiOperation({ summary: 'Create a single rating' })
    create(@Body() dto: CreateRatingDto) {
        return this.ratingService.create(dto);
    }

    @Get('/list')
    @ApiOperation({ summary: 'Get all ratings' })
    findAll(): Promise<any> {
        return this.ratingService.findAll();
    }

    @Get('branch-ratings/list')
    @ApiOperation({ summary: 'Get branch ratings for ADMIN_BRAND' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Role([EnumRoles.ADMIN_BRAND])
    getBranchRatings(@Req() req: any): Promise<any> {
        const branchId = req.user?.branchId;
        return this.ratingService.getBranchRatings(branchId);
    }

    @Get('product/:productId')
    @ApiOperation({ summary: 'Get ratings by product ID' })
    findByProduct(@Param('productId') productId: number) {
        return this.ratingService.findByProduct(productId);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRatingDto) {
        return this.ratingService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.ratingService.remove(id);
    }
}
