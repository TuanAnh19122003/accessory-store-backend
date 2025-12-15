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

async function seed() {
    try {
        // 1️⃣ Kết nối DB
        await sequelize.authenticate();
        console.log('✅ Connected to Supabase PostgreSQL');

        // 2️⃣ Reset DB (Postgres OK)
        await sequelize.sync({ force: true });
        console.log('✅ Database synced (force)');

        // ================= ROLES =================
        const roles = await Role.bulkCreate([
            { code: 'ADMIN', name: 'Quản trị viên' },
            { code: 'USER', name: 'Người dùng' }
        ]);
        console.log(`✅ Created ${roles.length} roles`);

        // ================= USERS =================
        const users = await User.bulkCreate([
            {
                firstname: 'Nguyễn',
                lastname: 'Văn A',
                email: 'admin@example.com',
                password: '123456',
                roleId: roles.find(r => r.code === 'ADMIN').id
            },
            {
                firstname: 'Trần',
                lastname: 'Thị B',
                email: 'user@example.com',
                password: '123456',
                roleId: roles.find(r => r.code === 'USER').id
            }
        ]);
        console.log(`✅ Created ${users.length} users`);

        // ================= CATEGORIES =================
        const categories = await Category.bulkCreate([
            { code: 'PHU-KIEN-1', name: 'Túi xách' },
            { code: 'PHU-KIEN-2', name: 'Mũ nón' },
            { code: 'PHU-KIEN-3', name: 'Kính mắt' },
            { code: 'PHU-KIEN-4', name: 'Đồng hồ' },
            { code: 'PHU-KIEN-5', name: 'Trang sức' }
        ]);
        console.log(`✅ Created ${categories.length} categories`);

        // ================= BRANDS =================
        const brands = await Brand.bulkCreate([
            { name: 'Gucci' },
            { name: 'Louis Vuitton' },
            { name: 'Nike' },
            { name: 'Adidas' },
            { name: 'Pandora' }
        ]);
        console.log(`✅ Created ${brands.length} brands`);

        // ================= DISCOUNTS =================
        const discounts = await Discount.bulkCreate([
            {
                name: 'Giảm 10%',
                description: 'Khuyến mãi 10%',
                percentage: 10,
                start_date: '2025-01-01',
                end_date: '2025-12-31'
            },
            {
                name: 'Giảm 20%',
                description: 'Khuyến mãi 20%',
                percentage: 20,
                start_date: '2025-01-01',
                end_date: '2025-06-30'
            }
        ]);
        console.log(`✅ Created ${discounts.length} discounts`);

        // ================= PRODUCTS =================
        const productNames = [
            'Túi xách da nữ', 'Túi xách nam', 'Balo du lịch', 'Mũ lưỡi trai thể thao',
            'Kính râm thời trang', 'Đồng hồ thể thao', 'Vòng tay bạc', 'Dây chuyền nữ',
            'Ví da nam', 'Túi tote nữ', 'Balo laptop', 'Mũ len mùa đông',
            'Đồng hồ thông minh', 'Nhẫn bạc nam', 'Khuyên tai nữ'
        ];

        const colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD'];

        const productsData = productNames.map((name, index) => {
            const category = faker.helpers.arrayElement(categories);
            const brand = faker.helpers.arrayElement(brands);
            const discount = index % 4 === 0
                ? faker.helpers.arrayElement(discounts)
                : null;

            return {
                name,
                slug: normalizeName(name),
                price: faker.number.int({ min: 100000, max: 2000000 }),
                color: faker.helpers.arrayElement(colors),
                categoryId: category.id,
                brandId: brand.id,
                discountId: discount ? discount.id : null,
                description: `Mô tả sản phẩm ${name}`,
                is_active: true,
                is_featured: index % 3 === 0
            };
        });

        await Product.bulkCreate(productsData);
        console.log(`✅ Created ${productsData.length} products`);

        // ================= CONTACTS =================
        const contacts = await Contact.bulkCreate([
            {
                name: 'Nguyễn Văn C',
                email: 'contact1@example.com',
                subject: 'Hỗ trợ',
                message: 'Tôi cần hỗ trợ về sản phẩm.'
            },
            {
                name: 'Trần Thị D',
                email: 'contact2@example.com',
                subject: 'Góp ý',
                message: 'Website rất tốt!'
            }
        ]);
        console.log(`✅ Created ${contacts.length} contacts`);

        console.log('🎉 SEED DATA COMPLETED SUCCESSFULLY');
        process.exit(0);

    } catch (error) {
        console.error('❌ SEED ERROR:', error);
        process.exit(1);
    }
}

seed();
