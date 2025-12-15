const {
    fetchProvinces,
    fetchDistricts,
    fetchWards
} = require('../utils/apiProvinces');

// ===== GET PROVINCES =====
exports.getProvinces = async (req, res) => {
    try {
        const data = await fetchProvinces();
        return res.status(200).json(data);
    } catch (err) {
        console.error('GET PROVINCES ERROR:', err);
        return res.status(500).json([]);
    }
};

// ===== GET DISTRICTS =====
exports.getDistricts = async (req, res) => {
    try {
        const { provinceCode } = req.params;

        if (!provinceCode) {
            return res.status(400).json([]);
        }

        const data = await fetchDistricts(provinceCode);
        return res.status(200).json(data);
    } catch (err) {
        console.error('GET DISTRICTS ERROR:', err);
        return res.status(500).json([]);
    }
};

// ===== GET WARDS =====
exports.getWards = async (req, res) => {
    try {
        const { districtCode } = req.params;

        if (!districtCode) {
            return res.status(400).json([]);
        }

        const data = await fetchWards(districtCode);
        return res.status(200).json(data);
    } catch (err) {
        console.error('GET WARDS ERROR:', err);
        return res.status(500).json([]);
    }
};

// ===== SUBMIT ADDRESS =====
exports.submitAddress = (req, res) => {
    const { street, province, district, ward } = req.body;

    if (!street || !province || !district || !ward) {
        return res.status(400).json({
            success: false,
            message: 'Bạn chưa nhập đầy đủ địa chỉ!'
        });
    }

    const fullAddress = `${street}, ${ward}, ${district}, ${province}`;

    return res.status(200).json({
        success: true,
        address: fullAddress
    });
};
