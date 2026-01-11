/**
 * ⚠️ CHỈ CHẠY FILE NÀY TRONG DEV
 */
if (process.env.NODE_ENV === 'production') {
    console.error('❌ Không được chạy seed trên production');
    process.exit(1);
}

const sequelize = require('./src/config/database');
const { faker } = require('@faker-js/faker');

// Import models
const Role = require('./src/models/role.model');
const User = require('./src/models/user.model');
const Category = require('./src/models/category.model');
const Brand = require('./src/models/brand.model');
const Discount = require('./src/models/discount.model');
const Product = require('./src/models/product.model');
const Contact = require('./src/models/contact.model');

// Utils
const { normalizeName } = require('./src/utils/normalizeName');
const hashPassword = require('./src/utils/hashPassword');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Database');

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ Database synced');

        const roles = await Role.bulkCreate([
            { code: 'ADMIN', name: 'Quản trị viên' },
            { code: 'USER', name: 'Người dùng' }
        ]);

        const hashedPassword = await hashPassword('123456');
        await User.create({
            firstname: 'Admin', lastname: 'Shop',
            email: 'admin@example.com', password: hashedPassword,
            roleId: roles.find(r => r.code === 'ADMIN').id
        });

        const categories = await Category.bulkCreate([
            { code: 'PHU-KIEN-1', name: 'Túi xách' },
            { code: 'PHU-KIEN-2', name: 'Mũ nón' },
            { code: 'PHU-KIEN-3', name: 'Kính mắt' },
            { code: 'PHU-KIEN-4', name: 'Đồng hồ' },
            { code: 'PHU-KIEN-5', name: 'Trang sức' }
        ]);

        const brands = await Brand.bulkCreate([
            { name: 'Gucci' }, { name: 'Louis Vuitton' }, { name: 'Nike' }, 
            { name: 'Adidas' }, { name: 'Pandora' }, { name: 'Casio' }, { name: 'RayBan' }
        ]);

        // Dữ liệu ảnh thực tế - Đã test link hoạt động tốt
        const aiTestData = [
            {
                name: 'Túi xách', catIdx: 0,
                images: [
                    'https://images.unsplash.com/photo-1584917033904-49122a5c9602?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1566150905458-1bf1fd15dcb4?auto=format&fit=crop&w=600'
                ]
            },
            {
                name: 'Mũ nón', catIdx: 1,
                images: [
                    'https://images.unsplash.com/photo-1588850561427-d88855324c86?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1533055640609-24b498dfd74c?auto=format&fit=crop&w=600'
                ]
            },
            {
                name: 'Kính mắt', catIdx: 2,
                images: [
                    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1511499767390-90342f53fb9a?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=600'
                ]
            },
            {
                name: 'Đồng hồ', catIdx: 3,
                images: [
                    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1508685096489-7aac29f25346?auto=format&fit=crop&w=600'
                ]
            },
            {
                name: 'Trang sức', catIdx: 4,
                images: [
                    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600',
                    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600'
                ]
            }
        ];

        const productsData = [];
        for (let i = 0; i < 50; i++) {
            const group = aiTestData[i % aiTestData.length];
            const brand = brands[Math.floor(Math.random() * brands.length)];
            const randomImg = group.images[Math.floor(Math.random() * group.images.length)];
            const productName = `${group.name} ${brand.name} ${faker.commerce.productAdjective()} ${i + 1}`;

            productsData.push({
                name: productName,
                slug: normalizeName(productName) + '-' + faker.string.alphanumeric(10),
                price: faker.number.int({ min: 100000, max: 3000000 }),
                color: faker.helpers.arrayElement(['Đen', 'Trắng', 'Vàng', 'Bạc']),
                categoryId: categories[group.catIdx].id,
                brandId: brand.id,
                description: `Sản phẩm ${productName} chính hãng. Hình ảnh rõ nét cho AI.`,
                image: randomImg, // Link đã bao gồm tham số tối ưu
                is_active: true,
                is_featured: i % 5 === 0
            });
        }

        await Product.bulkCreate(productsData);
        console.log(`✅ Created 50 products with valid images`);

        await Contact.create({
            name: 'Hệ thống test',
            email: 'test@example.com',
            subject: 'AI Search Test',
            message: 'Dữ liệu đã sẵn sàng.'
        });

        console.log('🎉 SEED COMPLETED!');
        process.exit(0);

    } catch (error) {
        console.error('❌ SEED ERROR:', error);
        process.exit(1);
    }
}

seed();