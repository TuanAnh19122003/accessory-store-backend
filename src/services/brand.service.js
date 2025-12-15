const Brand = require('../models/brand.model');

class BrandService {
    static async findAll() {
        const data = await Brand.findAll();
        return data;
    }

    static async create(data) {
        const brand = await Brand.create(data);
        return brand
    }

    static async findById(id) {
        const brand = await Brand.findByPk(id);
        if (!brand) throw new Error('brand not found');
        return brand;
    }

    static async update(id, data) {
        const brand = await Brand.findOne({ where: { id: id } });
        if (!brand) throw new Error("Không tìm thấy thương hiệu");
        return await brand.update(data);
    }

    static async delete(id) {
        return await Brand.destroy({ where: { id: id } })
    }
}

module.exports = BrandService;