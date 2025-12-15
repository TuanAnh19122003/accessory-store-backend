const axios = require('axios');

const BASE_URL = 'https://provinces.open-api.vn/api/v1';

// ===== Provinces =====
const fetchProvinces = async () => {
    const res = await axios.get(`${BASE_URL}/p`);
    return res.data.map(p => ({
        code: p.code,
        name: p.name
    }));
};

// ===== Districts =====
const fetchDistricts = async (provinceCode) => {
    const res = await axios.get(
        `${BASE_URL}/p/${provinceCode}?depth=2`
    );

    return (res.data.districts || []).map(d => ({
        code: d.code,
        name: d.name
    }));
};

// ===== Wards =====
const fetchWards = async (districtCode) => {
    const res = await axios.get(
        `${BASE_URL}/d/${districtCode}?depth=2`
    );

    return (res.data.wards || []).map(w => ({
        code: w.code,
        name: w.name
    }));
};

module.exports = {
    fetchProvinces,
    fetchDistricts,
    fetchWards
};
