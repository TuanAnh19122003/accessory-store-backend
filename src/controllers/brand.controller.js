const BrandService = require('../services/brand.service');

class RoleController {
    async findAll(req, res) {
        try {
            const data = await BrandService.findAll();
            res.status(200).json({
                success: true,
                message: 'Lấy danh sách thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lấy danh sách thất bại',
                error: error.message
            });
        }
    }

    async findById(req, res) {
        try {
            const role = await BrandService.findById(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Lấy thương hiệu thành công',
                data: role
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'thương hiệu không tồn tại',
                error: error.message
            });
        }
    }

    async create(req, res) {
        try {
            const data = await BrandService.create(req.body);
            res.status(200).json({
                success: true,
                message: 'Thêm thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Thêm thất bại',
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const data = await BrandService.update(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Cập nhật thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Cập nhật thất bại',
                error: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const deletedCount = await BrandService.delete(req.params.id);

            if (deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thương hiệu để xóa'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Xóa thương hiệu thành công'
            });
        } catch (error) {
            console.error('Lỗi:', error);
            res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi xóa thương hiệu",
                error: error.message
            });
        }
    }
}

module.exports = new RoleController();
