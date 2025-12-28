
import pool from '../config/db.js';

const getProducts = async (req, res) => {
    try {
        const { minPrice, maxPrice, brand, sort, search, page = 1, limit = 12 } = req.query;

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
        if (search) {
            whereClause += ` AND p.name ILIKE $${paramIndex}`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // 1. Get Total Count (for pagination)
        const countQuery = `
            SELECT COUNT(*) 
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limitNum);

        // 2. Get Paginated Data
        let dataQuery = `
            SELECT p.*, b.brand_name 
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            ${whereClause}
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

        // Pagination
        dataQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        const dataParams = [...params, limitNum, offset];

        const result = await pool.query(dataQuery, dataParams);

        // Return structured response
        res.json({
            data: result.rows,
            pagination: {
                total: totalItems,
                page: pageNum,
                limit: limitNum,
                totalPages: totalPages
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching products" });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        let query = `
            SELECT p.*, b.brand_name 
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            WHERE 
        `;
        
        // Detect if id is numeric (ID) or string (slug)
        const isNumeric = /^\d+$/.test(id);
        
        if (isNumeric) {
            query += `p.id = $1`;
        } else {
             // Assuming you have a 'slug' column. If not, you might need to use name or add a slug column.
             // Given the user request implies slugs exist or are desired. 
             // IF NO SLUG COLUMN: You might need to add one or use dynamic generation. 
             // Ideally we should check if column exists first or just assume providing user request implies it.
             // Let's assume 'slug' column exists as is standard.
            query += `p.slug = $1`;
        }

        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        const product = result.rows[0];

        // Fetch variants and map to camelCase, excluding old_price and internal IDs if needed
        const variantsRes = await pool.query('SELECT * FROM product_variants WHERE product_id = $1', [product.id]);
        product.variants = variantsRes.rows.map(v => {
            // Destructure to exclude unwanted fields but keep old_price
            const { id, variant_id, created_at, ...rest } = v; 
            return {
                ...rest,
                id: variant_id, // Ensure frontend has an ID for keys
                bestPrice: v.best_price, 
                lastPrice: v.last_price
            };
        });

        res.json(product);

    } catch (error) {
         console.error(error);
         res.status(500).json({ message: "Error fetching product details" });
    }
};



const getBrands = async (req, res) => {
    try {
        const query = 'SELECT * FROM brands ORDER BY brand_name ASC';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching brands" });
    }
};

export default { getProducts, getProductById, getBrands };
