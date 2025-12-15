const axios = require('axios');

const BASE_URL = 'https://provinces.open-api.vn/api';

// ===== Provinces =====
const fetchProvinces = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/p`);
        return res.data.map(p => ({
            code: p.code,
            name: p.name
        }));
    } catch (error) {
        console.error('Lỗi khi lấy danh sách tỉnh:', error.message);
        return [];
    }
};

// ===== Districts =====
const fetchDistricts = async (provinceCode) => {
    try {
        const res = await axios.get(`${BASE_URL}/p/${provinceCode}?depth=2`);
        return (res.data.districts || []).map(d => ({
            code: d.code,
            name: d.name
        }));
    } catch (error) {
        console.error('Lỗi khi lấy quận/huyện:', error.message);
        return [];
    }
};

// ===== Wards =====
const fetchWards = async (districtCode) => {
    try {
        const res = await axios.get(`${BASE_URL}/d/${districtCode}?depth=2`);
        return (res.data.wards || []).map(w => ({
            code: w.code,
            name: w.name
        }));
    } catch (error) {
        console.error('Lỗi khi lấy phường/xã:', error.message);
        return [];
    }
};

module.exports = {
    fetchProvinces,
    fetchDistricts,
    fetchWards
};
