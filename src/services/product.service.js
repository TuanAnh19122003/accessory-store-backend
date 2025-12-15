const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Discount = require('../models/discount.model');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

class ProductService {
    // Lấy tất cả sản phẩm kèm filter, pagination
    static async findAll(options = {}) {
        const { offset, limit, search, categories, priceMin, priceMax, featured } = options;

        const whereClause = {};

        // Search theo id, name, category
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { '$category.name$': { [Op.like]: `%${search}%` } }
            ];
        }

        // Filter price
        if (priceMin !== undefined && priceMax !== undefined) {
            whereClause.price = { [Op.between]: [priceMin, priceMax] };
        }

        // Filter featured
        if (featured !== undefined) {
            whereClause.is_featured = featured === 'true';
        }

        // Include Category và Discount
        const includeClause = [
            {
                model: Category,
                as: 'category',
                attributes: ['name'],
                where: categories && categories.length > 0 ? { name: { [Op.in]: categories } } : undefined
            },
            {
                model: Discount,
                as: 'discount',
                attributes: ['name', 'percentage']
            }
        ];

        const queryOptions = {
            where: whereClause,
            include: includeClause,
            order: [['createdAt', 'ASC']],
        };

        if (offset !== undefined && limit !== undefined) {
            queryOptions.offset = offset;
            queryOptions.limit = limit;
        }

        const result = await Product.findAndCountAll(queryOptions);

        // Map dữ liệu trả về: finalPrice + status
        const rows = result.rows.map(p => {
            const product = p.toJSON();
            product.originalPrice = product.price;

            // Tính finalPrice nếu có giảm giá
            if (product.discount) {
                product.finalPrice = Math.round(product.price * (1 - product.discount.percentage / 100));
            } else {
                product.finalPrice = product.price;
            }

            // Status: 1 = active, 0 = ngừng bán
            product.status = product.is_active;

            return product;
        });

        return { count: result.count, rows };
    }

    // Lấy chi tiết sản phẩm theo slug
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
        if (p.discount) {
            p.finalPrice = Math.round(product.price * (1 - product.discount.percentage / 100));
        } else {
            p.finalPrice = p.price;
        }
        p.status = p.is_active;

        return p;
    }

    // Tạo sản phẩm
    static async create(data, file) {
        if (file) {
            data.image = `uploads/${file.filename}`;
        }
        const product = await Product.create(data);
        return product;
    }

    static async update(id, data, file) {
        const product = await Product.findOne({ where: { id } });
        if (!product) throw new Error('Product not found');

        if (file) {
            if (product.image) {
                const oldImagePath = path.join(__dirname, '..', product.image);
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
            data.image = `uploads/${file.filename}`;
        }

        if (data.discountId === '' || data.discountId === 'null' || data.discountId === null) {
            data.discountId = null;
        } else {
            data.discountId = parseInt(data.discountId, 10);
            if (isNaN(data.discountId)) data.discountId = null;
        }

        return await product.update(data);
    }

    static async delete(id) {
        const product = await Product.findByPk(id);
        if (!product) return 0;

        if (product.image) {
            const imagePath = path.join(__dirname, '..', product.image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        return await Product.destroy({ where: { id } });
    }
}

module.exports = ProductService;
