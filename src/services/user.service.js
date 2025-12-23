const hashPassword = require('../utils/hashPassword');
const Role = require('../models/role.model');
const User = require('../models/user.model');
const { uploadToCloudinary } = require('../utils/multer');

class UserService {
    static async findAll(options = {}) {
        const { offset, limit, search } = options;
        const whereClause = {};
        if (search) {
            const { Op } = require('sequelize');
            whereClause[Op.or] = [
                { id: { [Op.like]: `%${search}%` } },
                { lastname: { [Op.like]: `%${search}%` } },
                { firstname: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { is_active: { [Op.like]: `%${search}%` } },
            ];
        }

        return await User.findAndCountAll({
            where: whereClause,
            include: { model: Role, as: 'role', attributes: ['id', 'name'] },
            offset,
            limit,
            order: [['createdAt', 'ASC']]
        });
    }

    static async findById(id) {
        const user = await User.findByPk(id, {
            include: { model: Role, as: 'role', attributes: ['id', 'name'] }
        });
        if (!user) throw new Error('User không tồn tại');
        return user;
    }

    static async create(data, file) {
        if (data.password) data.password = await hashPassword(data.password);

        if (file) {
            const result = await uploadToCloudinary(file);
            data.image = result.url;
            data.image_public_id = result.public_id;
            console.log(result.secure_url)
        }

        return await User.create(data);
    }

    static async update(id, data, file) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User không tồn tại');

        if (data.password) {
            data.password = await hashPassword(data.password);
        }

        if (file) {
            // Xóa ảnh cũ trên Cloudinary
            if (user.image_public_id) {
                const cloudinary = require('../config/cloudinaryConfig');
                await cloudinary.uploader.destroy(user.image_public_id);
            }

            const result = await uploadToCloudinary(file);
            data.image = result.url;
            data.image_public_id = result.public_id;
        }

        return await user.update(data);
    }

    static async delete(id) {
        const user = await User.findByPk(id);
        if (!user) return 0;

        if (user.image_public_id) {
            const cloudinary = require('../config/cloudinaryConfig');
            await cloudinary.uploader.destroy(user.image_public_id);
        }

        return await User.destroy({ where: { id } });
    }
}

module.exports = UserService;
