import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, In } from 'typeorm';
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

  async findAll(userRole?: string, userBranchId?: number) {
    if (userRole === 'ADMIN_SYSTEM') {
      // ADMIN_SYSTEM chỉ xem sản phẩm hệ thống
      const products = await this.productRepo.find({
        where: { scope: 'Hệ thống' },
        relations: {
          sizes: true,
          productMaterials: {
            rawMaterial: true,
          },
        },
        order: { id: 'ASC' },
      });

      return this.mapProducts(products);
    } else if (userRole === 'CUSTOMER') {
      // CUSTOMER chỉ xem sản phẩm hệ thống (không thấy sản phẩm độc quyền)
      const products = await this.productRepo.find({
        where: { scope: 'Hệ thống' },
        relations: {
          sizes: true,
          productMaterials: {
            rawMaterial: true,
          },
        },
        order: { id: 'ASC' },
      });

      return this.mapProducts(products);
    } else if ((userRole === 'ADMIN_BRAND' || userRole === 'STAFF') && userBranchId) {
      // ADMIN_BRAND và STAFF xem sản phẩm hệ thống + sản phẩm trong ProductBranch của mình
      const systemProducts = await this.productRepo.find({
        where: { scope: 'Hệ thống' },
        relations: {
          sizes: true,
          productMaterials: {
            rawMaterial: true,
          },
        },
      });

      // Lấy các sản phẩm chi nhánh của mình
      const branchProductRecords = await this.productBranchRepo.find({
        where: { branchId: userBranchId },
        relations: {
          product: {
            sizes: true,
            productMaterials: {
              rawMaterial: true,
            },
          },
        },
      });

      const branchProducts = branchProductRecords
        .map(pb => pb.product)
        .filter(p => p.scope === 'Chi nhánh');

      // Gộp 2 danh sách và loại trùng
      const allProducts = [...systemProducts, ...branchProducts]
        .filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        )
        .sort((a, b) => a.id - b.id);

      return this.mapProducts(allProducts);
    }

    // Default: return all
    const products = await this.productRepo.find({
      relations: {
        sizes: true,
        productMaterials: {
          rawMaterial: true,
        },
      },
      order: { id: 'ASC' },
    });

    return this.mapProducts(products);
  }

  private mapProducts(products: Product[]) {
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
      scope: product.scope,
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

  async filterProducts(filterDto: { branchId?: number; category?: string }) {
    const { branchId, category } = filterDto;

    // Nếu có branchId, lọc theo chi nhánh
    if (branchId) {
      const productBranches = await this.productBranchRepo.find({
        where: {
          branchId: branchId,
          available: true,
        },
        relations: {
          product: {
            sizes: true,
            productMaterials: {
              rawMaterial: true,
            },
          },
        },
      });

      // Lọc sản phẩm có available = true ở bảng product
      let availableProducts = productBranches.filter(
        (pb) => pb.product.available === true
      );

      // Nếu có category, lọc thêm theo category
      if (category) {
        availableProducts = availableProducts.filter(
          (pb) => pb.product.category === category
        );
      }

      return availableProducts.map((pb) => {
        const product = pb.product;
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
      });
    }

    // Nếu không có branchId nhưng có category, lọc theo category từ tất cả sản phẩm
    if (category) {
      const products = await this.productRepo.find({
        where: {
          category: category,
          available: true,
        },
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

    // Nếu không có filter nào, trả về tất cả sản phẩm có sẵn
    return this.findAll();
  }

  async create(createDto: CreateProductDto, userRole?: string, userBranchId?: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { sizes, productMaterials, ...productData } = createDto;

      // Xác định scope dựa trên role
      const scope = userRole === 'ADMIN_SYSTEM' ? 'Hệ thống' : 'Chi nhánh';

      const product = await queryRunner.manager.save(Product, {
        ...productData,
        scope,
      });

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

      // Logic khác nhau cho ADMIN_SYSTEM và ADMIN_BRAND
      if (scope === 'Hệ thống') {
        // ADMIN_SYSTEM: thêm vào tất cả chi nhánh
        const branches = await queryRunner.manager.find(Branch);
        const productBranches = branches.map((branch) => {
          const pb = new ProductBranch();
          pb.product = product;
          pb.branch = branch;
          pb.available = true;
          return pb;
        });
        await queryRunner.manager.save(ProductBranch, productBranches);
      } else if (userBranchId) {
        // ADMIN_BRAND: chỉ thêm vào chi nhánh của mình
        const branch = await queryRunner.manager.findOne(Branch, { where: { id: userBranchId } });
        if (branch) {
          const pb = new ProductBranch();
          pb.product = product;
          pb.branch = branch;
          pb.available = true;
          await queryRunner.manager.save(ProductBranch, pb);
        }
      }

      return { message: 'Product created successfully', id: product.id };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Create product failed: ' + err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateDto: UpdateProductDto, userRole?: string, userBranchId?: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['sizes', 'productMaterials'],
    });

    if (!product) throw new NotFoundException('Product not found');

    // Kiểm tra quyền
    if (userRole === 'ADMIN_SYSTEM') {
      // ADMIN_SYSTEM chỉ được sửa sản phẩm Hệ thống
      if (product.scope === 'Chi nhánh') {
        throw new ForbiddenException('Bạn không có quyền sửa sản phẩm độc quyền của chi nhánh');
      }
    } else if (userRole === 'ADMIN_BRAND') {
      if (product.scope === 'Hệ thống') {
        throw new ForbiddenException('Bạn không có quyền sửa sản phẩm hệ thống');
      }
      
      // Kiểm tra xem sản phẩm có thuộc chi nhánh của mình không
      const productBranch = await this.productBranchRepo.findOne({
        where: { productId: id, branchId: userBranchId },
      });
      
      if (!productBranch) {
        throw new ForbiddenException('Bạn không có quyền sửa sản phẩm của chi nhánh khác');
      }
    }

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

  async remove(id: number, userRole?: string, userBranchId?: number) {
    const product = await this.productRepo.findOne({ where: { id } });
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Kiểm tra quyền
    if (userRole === 'ADMIN_SYSTEM') {
      // ADMIN_SYSTEM chỉ được xóa sản phẩm Hệ thống
      if (product.scope === 'Chi nhánh') {
        throw new ForbiddenException('Bạn không có quyền xóa sản phẩm độc quyền của chi nhánh');
      }
    } else if (userRole === 'ADMIN_BRAND') {
      if (product.scope === 'Hệ thống') {
        throw new ForbiddenException('Bạn không có quyền xóa sản phẩm hệ thống');
      }
      
      // Kiểm tra xem sản phẩm có thuộc chi nhánh của mình không
      const productBranch = await this.productBranchRepo.findOne({
        where: { productId: id, branchId: userBranchId },
      });
      
      if (!productBranch) {
        throw new ForbiddenException('Bạn không có quyền xóa sản phẩm của chi nhánh khác');
      }
    }

    const result = await this.productRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Product not found');
    }

    return { message: 'Product deleted successfully' };
  }
}
