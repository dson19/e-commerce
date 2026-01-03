import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ErrorResponse } from '../middleware/errorMiddleware.js';

const getProducts = asyncHandler(async (req, res) => {
    const { minPrice, maxPrice, brand, category, sort, search, page = 1, limit = 12 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Base query conditions
    let whereClause = `WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (minPrice) {
        const min = parseInt(minPrice);
        if (!isNaN(min)) {
            whereClause += ` AND CAST(p.min_price AS BIGINT) >= $${paramIndex}`;
            params.push(min);
            paramIndex++;
        }
    }
    if (maxPrice) {
        const max = parseInt(maxPrice);
        if (!isNaN(max)) {
            whereClause += ` AND CAST(p.min_price AS BIGINT) <= $${paramIndex}`;
            params.push(max);
            paramIndex++;
        }
    }
    if (brand) {
        whereClause += ` AND (b.brand_name ILIKE $${paramIndex} OR b.slug ILIKE $${paramIndex})`;
        params.push(`%${brand}%`);
        paramIndex++;
    }
    if (category) {
        whereClause += ` AND (c.category_name ILIKE $${paramIndex} OR pc.category_name ILIKE $${paramIndex})`;
        params.push(`%${category}%`);
        paramIndex++;
    }
    if (search) {
        whereClause += ` AND (p.name ILIKE $${paramIndex} OR b.brand_name ILIKE $${paramIndex} OR c.category_name ILIKE $${paramIndex} OR pc.category_name ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
    }

    // 1. Get Total Count
    const countQuery = `
        SELECT COUNT(*) 
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN categories pc ON c.parent_id = pc.category_id
        ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limitNum);

    // 2. Get Paginated Data
    let dataQuery = `
        SELECT p.*, b.brand_name, c.category_name, pc.category_name as parent_category_name,
               COALESCE(SUM(i.stock), 0) as total_stock,
               COALESCE(SUM(i.reserved_stock), 0) as total_reserved
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN categories pc ON c.parent_id = pc.category_id
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        LEFT JOIN inventory i ON pv.variant_id = i.variant_id
        ${whereClause}
        GROUP BY p.id, b.brand_name, c.category_name, pc.category_name
    `;

    // Sorting
    if (sort === 'price_asc') {
        dataQuery += ` ORDER BY CAST(p.min_price AS BIGINT) ASC`;
    } else if (sort === 'price_desc') {
        dataQuery += ` ORDER BY CAST(p.min_price AS BIGINT) DESC`;
    } else if (sort === 'newest') {
        dataQuery += ` ORDER BY p.created_at DESC`;
    } else {
        dataQuery += ` ORDER BY p.id ASC`;
    }

    dataQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    const dataParams = [...params, limitNum, offset];

    const result = await pool.query(dataQuery, dataParams);

    res.json({
        success: true,
        data: result.rows,
        pagination: {
            total: totalItems,
            page: pageNum,
            limit: limitNum,
            totalPages: totalPages
        }
    });
});

const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let query = `
        SELECT p.*, b.brand_name, c.category_name, pc.category_name as parent_category_name
        FROM products p
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN categories pc ON c.parent_id = pc.category_id
        WHERE 
    `;
    
    const isNumeric = /^\d+$/.test(id);
    
    if (isNumeric) {
        query += `p.id = $1`;
    } else {
        query += `p.slug = $1`;
    }

    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
        throw new ErrorResponse("Product not found", 404);
    }

    const product = result.rows[0];

    const variantsRes = await pool.query('SELECT pv.*,i.stock, i.reserved_stock FROM product_variants pv LEFT JOIN inventory i ON pv.variant_id = i.variant_id WHERE product_id = $1', [product.id]);
    product.variants = variantsRes.rows.map(v => {
        const { id, variant_id, created_at, ...rest } = v; 
        let availableStock = (v.stock || 0) - (v.reserved_stock || 0);
        if (availableStock < 0) availableStock = 0;
        return {
            ...rest,
            id: variant_id,
            bestPrice: v.best_price, 
            lastPrice: v.last_price,
            stock: v.stock || 0,
            reserved_stock: v.reserved_stock || 0,
            availableStock: availableStock
        };
    });

    res.json({
        success: true,
        data: product
    });
});

const getBrands = asyncHandler(async (req, res) => {
    const query = 'SELECT * FROM brands ORDER BY brand_name ASC';
    const result = await pool.query(query);
    res.json({
        success: true,
        data: result.rows
    });
});

const getParentCategories = asyncHandler(async (req, res) => {
    const query = 'SELECT * FROM categories WHERE parent_id IS NULL ORDER BY category_id ASC';
    const result = await pool.query(query);
    res.json({
        success: true,
        data: result.rows
    });
});

export default { getProducts, getProductById, getBrands, getParentCategories };
