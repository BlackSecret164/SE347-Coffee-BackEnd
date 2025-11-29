import { Controller, Post, Body, Get, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { RatingService } from '../services/rating.service';
import { CreateRatingDto, UpdateRatingDto } from '../dtos/rating.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Rating')
@Controller('ratings')
export class RatingController {
    constructor(private readonly ratingService: RatingService) { }

    @Post()
    create(@Body() dto: CreateRatingDto) {
        return this.ratingService.create(dto);
    }

    @Get('/list')
    findAll(): Promise<any> {
        return this.ratingService.findAll();
    }

    @Get('product/:productId')
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
