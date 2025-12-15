const Role = require('../models/role.model');

class RoleService {
    static async findAll() {
        const data = await Role.findAll();
        return data;
    }

    static async findById(id) {
        try {
            const role = await Role.findOne({ where: { id } });
            if (!role) throw new Error('Vai trò không tồn tại');
            return role;
        } catch (error) {
            throw new Error(`Lỗi khi tìm vai trò: ${error.message}`);
        }
    }

    static async create(data) {
        const role = await Role.create(data);
        return role
    }

    static async update(id, data) {
        const role = await Role.findOne({ where: { id: id } });
        if (!role) throw new Error("Không tìm thấy vai trò");
        return await role.update(data);
    }

    static async delete(id) {
        return await Role.destroy({ where: { id: id } })
    }
}

module.exports = RoleService;