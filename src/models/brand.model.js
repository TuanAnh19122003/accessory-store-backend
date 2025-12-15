const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const { normalizeName } = require('../utils/normalizeName');

const Brand = sequelize.define('Brand', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    slug: {
        type: DataTypes.STRING,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
}, {
    tableName: 'brands',
    timestamps: true,
    hooks: {
        beforeCreate: (brand) => {
            if (brand.name) {
                brand.slug = normalizeName(brand.name);
            }
        },
        beforeUpdate: (brand) => {
            if (brand.name) {
                brand.slug = normalizeName(brand.name);
            }
        }
    }
});

module.exports = Brand;
