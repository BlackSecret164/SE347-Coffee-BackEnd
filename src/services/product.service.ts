import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductSize } from '../entities/product_size.entity';
import { CreateProductDto } from '../dtos/product.dto';
import { UpdateProductDto } from '../dtos/product.dto';
import { UpdateStatusDto } from '../dtos/product.dto';
import { ProductMaterial } from '../entities/product-material.entity';
import { ProductBranch } from 'src/entities/product_branch.entity';
import { Branch } from 'src/entities/branches.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductSize)
    private readonly sizeRepo: Repository<ProductSize>,

    @InjectRepository(ProductBranch)
    private readonly productBranchRepo: Repository<ProductBranch>,

    private readonly dataSource: DataSource,
  ) { }

  async findAll() {
    const products = await this.productRepo.find({
      relations: {
        sizes: true,
        productMaterials: {
          rawMaterial: true,
        },
      },
      order: { id: 'ASC' },
    });

    return products.map((product) => ({
      id: product.id.toString(),
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      available: product.available,
      hot: product.hot,
      cold: product.cold,
      isPopular: product.isPopular,
      isNew: product.isNew,
      sizes: product.sizes
        .sort((a, b) => {
          const order = { 'S': 1, 'M': 2, 'L': 3 };
          return order[a.sizeName] - order[b.sizeName];
        })
        .map((s) => ({
          sizeName: s.sizeName,
          price: s.price,
        })),
      materials: product.productMaterials.map((pm) => ({
        materialId: pm.materialId,
        materialQuantity: pm.materialQuantity,
        name: pm.rawMaterial.name,
      })),

    }));
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['sizes', 'productMaterials', 'productMaterials.rawMaterial'],
    });

    if (!product) throw new NotFoundException('Product not found');

    return {
      id: product.id.toString(),
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image,
      available: product.available,
      hot: product.hot,
      cold: product.cold,
      isPopular: product.isPopular,
      isNew: product.isNew,
      sizes: product.sizes
        .sort((a, b) => {
          const order = { 'S': 1, 'M': 2, 'L': 3 };
          return order[a.sizeName] - order[b.sizeName];
        })
        .map((s) => ({
          sizeName: s.sizeName,
          price: s.price,
        })),
      materials: product.productMaterials.map((pm) => ({
        materialId: pm.materialId,
        materialQuantity: pm.materialQuantity,
        name: pm.rawMaterial.name,
      })),
    };
  }

  async findBranchesByProduct(productId: number) {
    const records = await this.productBranchRepo.find({
      where: {
        product: { id: productId },
        available: true,
      },
      relations: ['branch'],
      order: { branch: { id: 'ASC' } },
    });

    return records.map((record) => ({
      id: record.branch.id,
      name: record.branch.name,
      address: record.branch.address,
      phone: record.branch.phone,
      createdAt: record.branch.createdAt,
    }));
  }

  async create(createDto: CreateProductDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { sizes, productMaterials, ...productData } = createDto;

      const product = await queryRunner.manager.save(Product, productData);

      const sizeEntities = sizes.map((s) => {
        const size = new ProductSize();
        size.sizeName = s.sizeName;
        size.price = s.price;
        size.product = product;
        return size;
      });

      await queryRunner.manager.save(ProductSize, sizeEntities);

      if (productMaterials && productMaterials.length > 0) {
        const materialEntities = productMaterials.map((m) => {
          const pm = new ProductMaterial();
          pm.productId = product.id;
          pm.materialId = m.materialId;
          pm.materialQuantity = m.materialQuantity;
          return pm;
        });
        await queryRunner.manager.save(ProductMaterial, materialEntities);
      }

      await queryRunner.commitTransaction();
      const branches = await queryRunner.manager.find(Branch);

      const productBranches = branches.map((branch) => {
        const pb = new ProductBranch();
        pb.product = product;
        pb.branch = branch;
        pb.available = true;
        return pb;
      });

      await queryRunner.manager.save(ProductBranch, productBranches);

      return { message: 'Product created successfully', id: product.id };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Create product failed: ' + err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateDto: UpdateProductDto) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['sizes', 'productMaterials'],
    });

    if (!product) throw new NotFoundException('Product not found');

    const { sizes, productMaterials, ...productUpdate } = updateDto;

    await this.productRepo.update(id, productUpdate);

    // Xoá sizes cũ và thêm lại
    await this.sizeRepo.delete({ productId: id });
    const sizeEntities = sizes.map((s) => {
      const size = new ProductSize();
      size.sizeName = s.sizeName;
      size.price = s.price;
      size.product = product;
      return size;
    });
    await this.sizeRepo.save(sizeEntities);

    // Xoá productMaterials cũ và thêm lại
    await this.dataSource.getRepository(ProductMaterial).delete({ productId: id });
    if (productMaterials && productMaterials.length > 0) {
      const materialEntities = productMaterials.map((m) => {
        const pm = new ProductMaterial();
        pm.productId = id;
        pm.materialId = m.materialId;
        pm.materialQuantity = m.materialQuantity;
        return pm;
      });
      await this.dataSource.getRepository(ProductMaterial).save(materialEntities);
    }

    return { message: 'Product updated successfully' };
  }

  async updateAvailability(id: number, dto: UpdateStatusDto) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    product.available = dto.available;
    await this.productRepo.save(product);

    return { message: 'Product availability updated' };
  }

  async remove(id: number) {
    const result = await this.productRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Product not found');
    }

    return { message: 'Product deleted successfully' };
  }
}
