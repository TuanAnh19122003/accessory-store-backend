const DiscountService = require('../services/discount.service');

class DiscountController {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page);
            const pageSize = parseInt(req.query.pageSize);
            const search = req.query.search || null;

            let result;

            if (!page || !pageSize) {
                // Không phân trang
                result = await DiscountService.findAll({ search });
                return res.status(200).json({
                    success: true,
                    message: 'Lấy danh sách thành công',
                    data: result.rows,
                    total: result.count
                });
            }

            const offset = (page - 1) * pageSize;
            result = await DiscountService.findAll({ offset, limit: pageSize, search });

            res.status(200).json({
                success: true,
                message: 'Lấy danh sách thành công',
                data: result.rows,
                total: result.count,
                page,
                pageSize
            });
        } catch (error) {
            console.error('Lỗi:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách',
                error: error.message
            });
        }
    }

    async findById(req, res) {
        try {
            const role = await DiscountService.findById(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Lấy giảm giá thành công',
                data: role
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'giảm giá không tồn tại',
                error: error.message
            });
        }
    }

    async create(req, res) {
        try {
            const data = await DiscountService.create(req.body);
            res.status(200).json({
                success: true,
                message: 'Thêm giảm giá thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const data = await DiscountService.update(req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Cập nhật giảm giá thành công',
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const data = await DiscountService.delete(req.params.id);
            res.status(200).json({
                success: true,
                message: 'Xóa giảm giá thành công',
            });
        } catch (error) {
            console.log('Loi: ', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new DiscountController();