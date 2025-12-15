const ProductService = require('../services/product.service');

class ProductController {
    async findAll(req, res) {
        try {
            const { page = 1, pageSize = 10, search, categories, types, priceMin, priceMax, featured } = req.query;

            const filterOptions = {
                search: search || null,
                categories: categories ? categories.split(',') : [],
                types: types ? types.split(',') : [],
                priceMin: priceMin ? parseFloat(priceMin) : 0,
                priceMax: priceMax ? parseFloat(priceMax) : 10000000,
                featured: featured || undefined
            };

            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            const limit = parseInt(pageSize);

            const result = await ProductService.findAll({ ...filterOptions, offset, limit });

            res.status(200).json({
                success: true,
                message: 'Lấy danh sách sản phẩm thành công',
                data: result.rows,
                total: result.count,
                page: parseInt(page),
                pageSize: limit,
                totalPages: Math.ceil(result.count / limit)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm',
                error: error.message
            });
        }
    }

    async findBySlug(req, res) {
        try {
            const { slug } = req.params;
            const product = await ProductService.findBySlug(slug);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Sản phẩm không tồn tại'
                });
            }

            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy chi tiết sản phẩm',
                error: error.message
            });
        }
    }

    async create(req, res) {
        try {
            const data = await ProductService.create(req.body, req.file);
            res.status(200).json({
                success: true,
                message: 'Thêm sản phẩm thành công',
                data
            });
        } catch (error) {
            console.log('Loi: ', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const data = await ProductService.update(req.params.id, req.body, req.file);
            res.status(200).json({
                success: true,
                message: 'Cập nhật sản phẩm thành công',
                data
            });
        } catch (error) {
            console.log('Loi: ', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id;
            const deletedCount = await ProductService.delete(id);

            if (deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm để xóa'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Xóa thành công sản phẩm'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Đã xảy ra lỗi khi xóa sản phẩm",
                error: error.message
            });
        }
    }

}

module.exports = new ProductController();