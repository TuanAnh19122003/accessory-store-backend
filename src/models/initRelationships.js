module.exports = (db) => {
    const {
        Role,
        User,
        Category,
        Product,
        Discount,
        Brand,
        Cart,
        CartItem,
        Order,
        OrderItem,
        Contact
    } = db;

    // ========== Role ↔ User ==========
    Role.hasMany(User, { foreignKey: 'roleId', as: 'users', onDelete: 'RESTRICT' });
    User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

    // ========== Category ↔ Product ==========
    Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products', onDelete: 'CASCADE' });
    Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

    // ========== Brand ↔ Product ==========
    Brand.hasMany(Product, { foreignKey: 'brandId', as: 'products', onDelete: 'SET NULL' });
    Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });

    // ========== Discount ↔ Product ==========
    // Một Discount có thể áp dụng cho nhiều Product (1-nhiều)
    Discount.hasMany(Product, { foreignKey: 'discountId', as: 'products', onDelete: 'SET NULL' });
    Product.belongsTo(Discount, { foreignKey: 'discountId', as: 'discount' });

    // ========== User ↔ Cart ==========
    User.hasOne(Cart, { foreignKey: 'userId', as: 'cart', onDelete: 'CASCADE' });
    Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // ========== Cart ↔ CartItem ==========
    Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items', onDelete: 'CASCADE' });
    CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

    // ========== Product ↔ CartItem ==========
    Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems', onDelete: 'CASCADE' });
    CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

    // ========== User ↔ Order ==========
    User.hasMany(Order, { foreignKey: 'userId', as: 'orders', onDelete: 'CASCADE' });
    Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // ========== Order ↔ OrderItem ==========
    Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
    OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

    // ========== Product ↔ OrderItem ==========
    Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems', onDelete: 'CASCADE' });
    OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

    // ========== (Optional) Contact table (độc lập) ==========
    // Không cần liên kết — chỉ lưu thông tin liên hệ khách hàng
};
