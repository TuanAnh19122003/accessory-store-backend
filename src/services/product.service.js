const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Discount = require('../models/discount.model');
const { Op } = require('sequelize');
const { uploadToCloudinary } = require('../utils/multer');
const cloudinary = require('../config/cloudinaryConfig');
const mobilenet = require('@tensorflow-models/mobilenet');
const { createCanvas, loadImage } = require('canvas');
require('@tensorflow/tfjs-backend-cpu');
const tf = require('@tensorflow/tfjs');

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

    static async searchByImage(file) {
        if (!file) throw new Error('Vui lòng cung cấp hình ảnh');

        try {
            await tf.setBackend('cpu');
            await tf.ready();

            let imageSource;
            if (file.buffer) {
                imageSource = file.buffer;
            } else if (typeof file.path === 'string') {
                if (file.path.startsWith('http')) {
                    const response = await axios.get(file.path, { responseType: 'arraybuffer' });
                    imageSource = Buffer.from(response.data);
                } else {
                    imageSource = path.resolve(file.path);
                }
            } else {
                throw new Error('Định dạng file không được hỗ trợ bởi AI');
            }

            const img = await loadImage(imageSource);
            const canvas = createCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const model = await mobilenet.load();
            const predictions = await model.classify(canvas);

            if (!predictions || predictions.length === 0) {
                throw new Error('AI không thể nhận diện được vật thể');
            }

            // Lấy nhãn thô từ AI (ví dụ: "purse, handbag")
            const rawLabel = predictions[0].className.toLowerCase();

            // --- BẢNG MAPPING GIỮA AI VÀ CATEGORY CỦA BẠN ---
            const translationMap = {
                'purse': 'Túi xách',
                'handbag': 'Túi xách',
                'backpack': 'Túi xách',
                'wallet': 'Túi xách',
                'sunglass': 'Kính mắt',
                'sunglasses': 'Kính mắt',
                'spectacles': 'Kính mắt',
                'watch': 'Đồng hồ',
                'clock': 'Đồng hồ',
                'hat': 'Mũ nón',
                'cap': 'Mũ nón',
                'necklace': 'Trang sức',
                'bracelet': 'Trang sức',
                'ring': 'Trang sức',
                'jewelry': 'Trang sức'
            };

            // Tìm từ khóa tiếng Việt tương ứng
            let searchKeyword = '';
            const foundKey = Object.keys(translationMap).find(key => rawLabel.includes(key));

            if (foundKey) {
                searchKeyword = translationMap[foundKey];
            } else {
                // Nếu không có trong mapping, lấy từ đầu tiên của AI
                searchKeyword = rawLabel.split(',')[0].trim();
            }

            console.log(`AI Search: "${rawLabel}" ==> Tìm kiếm: "${searchKeyword}"`);

            // Tìm kiếm trong DB bằng từ khóa đã ánh xạ
            const searchResult = await this.findAll({
                search: searchKeyword,
                limit: 12
            });

            return {
                keyword: searchKeyword,
                products: searchResult.rows
            };

        } catch (error) {
            console.error("AI Search Error Details:", error);
            throw new Error("Lỗi nhận diện hình ảnh: " + error.message);
        }
    }
}

module.exports = ProductService;
