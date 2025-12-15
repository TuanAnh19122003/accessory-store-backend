const { fetchProvinces, fetchDistricts, fetchWards } = require('../utils/apiProvinces');

exports.getProvinces = async (req, res) => {
    try {
        const data = await fetchProvinces();
        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách tỉnh:', error);
        return res.status(500).json({
            success: false,
            message: 'Không lấy được danh sách tỉnh'
        });
    }
};

exports.getDistricts = async (req, res) => {
    try {
        const { provinceCode } = req.params;
        const data = await fetchDistricts(provinceCode);
        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Lỗi khi lấy quận/huyện:', error);
        return res.status(500).json({
            success: false,
            message: 'Không lấy được danh sách quận/huyện'
        });
    }
};

exports.getWards = async (req, res) => {
    try {
        const { districtCode } = req.params;
        const data = await fetchWards(districtCode);
        return res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Lỗi khi lấy phường/xã:', error);
        return res.status(500).json({
            success: false,
            message: 'Không lấy được danh sách phường/xã'
        });
    }
};

exports.submitAddress = (req, res) => {
    const { street, province, district, ward } = req.body;
    if (!street || !province || !district || !ward) {
        return res.status(400).send('Bạn chưa nhập đầy đủ địa chỉ!');
    }
    const fullAddress = `${street}, ${ward}, ${district}, ${province}`;
    res.send(`Bạn đã gửi địa chỉ đầy đủ: <b>${fullAddress}</b>`);
};
