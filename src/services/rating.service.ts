import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from '../entities/rating.entity';
import { Repository } from 'typeorm';
import { CreateRatingDto, ListRatingResponseDto, UpdateRatingDto } from '../dtos/rating.dto';
import { Customer } from '../entities/customer.entity';
import { Product } from '../entities/product.entity';
import { Order } from '../entities/order_tb.entity';
import { OrderDetails } from '../entities/order-details.entity';

@Injectable()
export class RatingService {
    constructor(
        @InjectRepository(Rating)
        private readonly ratingRepo: Repository<Rating>,
        @InjectRepository(Customer)
        private readonly customerRepo: Repository<Customer>,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(OrderDetails)
        private readonly detailRepo: Repository<OrderDetails>,
    ) { }

    async create(dto: CreateRatingDto) {
        const customer = await this.customerRepo.findOne({ where: { phone: dto.phoneCustomer } });
        const product = await this.productRepo.findOne({ where: { id: dto.productId } });

        if (!customer || !product) {
            throw new NotFoundException('Customer or Product not found');
        }

        const hasPurchased = await this.detailRepo
            .createQueryBuilder('detail')
            .innerJoin('detail.order', 'order')
            .where('order.phoneCustomer = :phone', { phone: dto.phoneCustomer })
            .andWhere('detail.productID = :productId', { productId: dto.productId })
            .getExists();

        if (!hasPurchased) {
            throw new NotFoundException('Customer must purchase the product before rating');
        }

        const rating = this.ratingRepo.create({
            description: dto.description,
            star: dto.star,
            customer,
            product,
        });

        return this.ratingRepo.save(rating);
    }

    async findAll(): Promise<ListRatingResponseDto[]> {
        const ratings = await this.ratingRepo.find({
            relations: ['customer', 'product'],
            order: { createdAt: 'DESC' },
        });

        return ratings.map((r) => ({
            id: r.id,
            description: r.description,
            star: r.star,
            createdAt: r.createdAt,
            customer: {
                phone: r.customer.phone,
                name: r.customer.name,
                rank: r.customer.rank,
            },
            product: {
                id: r.product.id,
                name: r.product.name,
                image: r.product.image,
            },
        }));
    }

    async findByProduct(productId: number) {
        const ratings = await this.ratingRepo.find({
            where: { product: { id: productId } },
            relations: ['customer'],
            order: { createdAt: 'DESC' },
        });

        const totalRatings = ratings.length;
        const starCounts = [0, 0, 0, 0, 0]; // Index 0 -> 1 star, ..., Index 4 -> 5 stars

        let sumStars = 0;

        for (const r of ratings) {
            const starIndex = r.star - 1;
            if (starIndex >= 0 && starIndex < 5) {
                starCounts[starIndex]++;
            }
            sumStars += r.star;
        }

        const averageStar = totalRatings ? +(sumStars / totalRatings).toFixed(1) : 0;

        return {
            averageStar,
            totalRatings,
            starCounts: {
                1: starCounts[0],
                2: starCounts[1],
                3: starCounts[2],
                4: starCounts[3],
                5: starCounts[4],
            },
            ratings: ratings.map((r) => ({
                id: r.id,
                description: r.description,
                star: r.star,
                createdAt: r.createdAt,
                customer: {
                    phone: r.customer.phone,
                    name: r.customer.name,
                    rank: r.customer.rank,
                },
            })),
        };
    }

    async update(id: number, dto: UpdateRatingDto): Promise<Rating> {
        const rating = await this.ratingRepo.findOne({ where: { id } });
        if (!rating) throw new NotFoundException(`Rating with ID ${id} not found`);

        rating.description = dto.description;
        rating.star = dto.star;
        return this.ratingRepo.save(rating);
    }

    async remove(id: number): Promise<{ message: string }> {
        const result = await this.ratingRepo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Rating with ID ${id} not found`);
        }
        return { message: 'Rating deleted successfully' };
    }
}
