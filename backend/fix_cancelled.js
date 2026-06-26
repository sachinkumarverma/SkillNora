import { query } from './src/config/db.js';

async function fixRefundEntries() {
    console.log("Starting refund entry fix for cancelled orders...");
    
    // Find all orders that are cancelled but don't have a corresponding 'refunded' entry
    const sql = `
        SELECT o.id, o.user_id, o.course_id, o.amount, o.created_at, c.price as original_price
        FROM orders o
        JOIN courses c ON o.course_id = c.id
        WHERE o.status = 'cancelled'
        AND NOT EXISTS (
            SELECT 1 FROM orders r 
            WHERE r.user_id = o.user_id 
            AND r.course_id = o.course_id 
            AND r.status = 'refunded'
        )
    `;
    
    try {
        const { rows: cancelledOrders } = await query(sql);
        console.log(`Found ${cancelledOrders.length} cancelled orders needing refund entries.`);
        
        for (const order of cancelledOrders) {
            const originalPrice = Number(order.original_price);
            // Revert the order amount to original price
            await query("UPDATE orders SET amount = $1 WHERE id = $2", [originalPrice, order.id]);
            
            // Re-calculate based on old 10 days assumption just for consistency with old data, or use 0
            // The user wanted 0 rs deduction because it was the same day. Let's use 0 days consumed (Math.floor(0) = 0).
            const diffDays = 0; 
            const consumedRatio = diffDays / 365;
            const deductAmount = originalPrice * consumedRatio;
            const refundAmount = originalPrice - deductAmount;
            
            // Insert refund entry
            const refundReceipt = `rfnd_${Date.now()}`;
            await query(`
                INSERT INTO orders (razorpay_order_id, user_id, course_id, amount, currency, status, receipt)
                VALUES ($1, $2, $3, $4, 'INR', 'refunded', $5)
            `, [`sim_refund_${Date.now()}_${order.id.substring(0,5)}`, order.user_id, order.course_id, -refundAmount, refundReceipt]);
            
            console.log(`Updated order ${order.id} back to Rs ${originalPrice} and created refund for Rs -${refundAmount}`);
        }
        
        console.log("Refund fix completed successfully.");
    } catch (e) {
        console.error("Error running fix:", e);
    }
}

fixRefundEntries().then(() => process.exit(0));
