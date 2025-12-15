const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Discount = require('../models/discount.model');
const { Op } = require('sequelize');
const { uploadToCloudinary } = require('../utils/multer');
const cloudinary = require('../config/cloudinaryConfig');

class ProductService {
    // Lấy tất cả sản phẩm
    static async findAll(options = {}) {
        const { offset, limit, search, categories, priceMin, priceMax, featured } = options;

        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { '$category.name$': { [Op.like]: `%${search}%` } }
            ];
        }

        if (priceMin !== undefined && priceMax !== undefined) {
            whereClause.price = { [Op.between]: [priceMin, priceMax] };
        }

        if (featured !== undefined) {
            whereClause.is_featured = featured === 'true';
        }

        const includeClause = [
            { model: Category, as: 'category', attributes: ['name'], where: categories && categories.length ? { name: { [Op.in]: categories } } : undefined },
            { model: Discount, as: 'discount', attributes: ['name', 'percentage'] }
        ];

        const queryOptions = { where: whereClause, include: includeClause, order: [['createdAt', 'ASC']] };
        if (offset !== undefined && limit !== undefined) {
            queryOptions.offset = offset;
            queryOptions.limit = limit;
        }

        const result = await Product.findAndCountAll(queryOptions);

        const rows = result.rows.map(p => {
            const product = p.toJSON();
            product.originalPrice = product.price;
            product.finalPrice = product.discount ? Math.round(product.price * (1 - product.discount.percentage / 100)) : product.price;
            product.status = product.is_active;
            return product;
        });

        return { count: result.count, rows };
    }

    // Lấy chi tiết sản phẩm
    static async findBySlug(slug) {
        const product = await Product.findOne({
            where: { slug },
            include: [
                { model: Category, as: 'category', attributes: ['name'] },
                { model: Discount, as: 'discount', attributes: ['name', 'percentage'] }
            ]
        });
        if (!product) return null;

        const p = product.toJSON();
        p.originalPrice = p.price;
        p.finalPrice = p.discount ? Math.round(p.price * (1 - p.discount.percentage / 100)) : p.price;
        p.status = p.is_active;
        return p;
    }

    // Tạo sản phẩm
    static async create(data, file) {
        if (file) {
            const result = await uploadToCloudinary(file);
            data.image = result.url;
            data.image_public_id = result.public_id;
        }
        const product = await Product.create(data);
        return product;
    }

    // Cập nhật sản phẩm
    static async update(id, data, file) {
        const product = await Product.findByPk(id);
        if (!product) throw new Error('Product not found');

        // Xóa ảnh cũ nếu có
        if (file && product.image_public_id) {
            await cloudinary.uploader.destroy(product.image_public_id);
        }

        if (file) {
            const result = await uploadToCloudinary(file);
            data.image = result.url;
            data.image_public_id = result.public_id;
        }

        if (!data.discountId || data.discountId === 'null') {
            data.discountId = null;
        } else {
            data.discountId = parseInt(data.discountId, 10);
            if (isNaN(data.discountId)) data.discountId = null;
        }

        return await product.update(data);
    }

    // Xóa sản phẩm
    static async delete(id) {
        const product = await Product.findByPk(id);
        if (!product) return 0;

        if (product.image_public_id) {
            await cloudinary.uploader.destroy(product.image_public_id);
        }

        return await Product.destroy({ where: { id } });
    }
}

module.exports = ProductService;
