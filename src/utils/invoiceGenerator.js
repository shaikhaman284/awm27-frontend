/**
 * Generate and download a PDF invoice for an order
 * Optimized to fit single page with proper spacing
 */
export const generateInvoice = async (order) => {
    try {
        // Dynamically import jsPDF only when needed (lazy loading)
        const { default: jsPDF } = await import('jspdf');

        // Create new PDF document (A4 size)
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const leftMargin = 12;
        const rightMargin = pageWidth - 12;
        let yPosition = 15;

        // Helper function to add text
        const addText = (text, x, y, options = {}) => {
            doc.setFontSize(options.fontSize || 9);
            doc.setFont(options.font || 'helvetica', options.fontStyle || 'normal');

            if (options.align === 'center') {
                doc.text(text, x, y, { align: 'center' });
            } else if (options.align === 'right') {
                doc.text(text, x, y, { align: 'right' });
            } else {
                doc.text(text, x, y);
            }
        };

        // Helper to set text color
        const setTextColor = (r, g, b) => {
            doc.setTextColor(r, g, b);
        };

        // Reset to black
        const resetColor = () => {
            doc.setTextColor(0, 0, 0);
        };

        // ===== HEADER =====
        addText('AMRAVATI WEARS MARKET', pageWidth / 2, yPosition, {
            fontSize: 14,
            fontStyle: 'bold',
            align: 'center'
        });
        yPosition += 5;

        addText('Your Local Clothing Marketplace', pageWidth / 2, yPosition, {
            fontSize: 8,
            align: 'center'
        });
        yPosition += 6;

        // Horizontal line
        doc.setLineWidth(0.3);
        doc.line(leftMargin, yPosition, rightMargin, yPosition);
        yPosition += 5;

        // ===== INVOICE TITLE =====
        addText('INVOICE', pageWidth / 2, yPosition, {
            fontSize: 12,
            fontStyle: 'bold',
            align: 'center'
        });
        yPosition += 6;

        // ===== ORDER DETAILS =====
        addText(`Order #: ${order.order_number}`, leftMargin, yPosition, {
            fontStyle: 'bold',
            fontSize: 8
        });
        yPosition += 4;

        const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        addText(`Date: ${orderDate}`, leftMargin, yPosition, { fontSize: 8 });
        yPosition += 4;

        const statusLabel = order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1);
        addText(`Status: ${statusLabel}`, leftMargin, yPosition, { fontSize: 8 });
        yPosition += 6;

        // ===== CUSTOMER DETAILS =====
        doc.setLineWidth(0.2);
        doc.line(leftMargin, yPosition, rightMargin, yPosition);
        yPosition += 4;

        addText('CUSTOMER DETAILS', leftMargin, yPosition, {
            fontSize: 9,
            fontStyle: 'bold'
        });
        yPosition += 5;

        addText(`Name: ${order.customer_name}`, leftMargin, yPosition, { fontSize: 7 });
        yPosition += 3;

        addText(`Phone: ${order.customer_phone}`, leftMargin, yPosition, { fontSize: 7 });
        yPosition += 3;

        // Address (with wrapping for long addresses)
        const addressText = `Address: ${order.delivery_address}, ${order.city} - ${order.pincode}`;
        const addressLines = doc.splitTextToSize(addressText, pageWidth - 24);
        addressLines.forEach(line => {
            addText(line, leftMargin, yPosition, { fontSize: 7 });
            yPosition += 3;
        });

        if (order.landmark) {
            addText(`Landmark: ${order.landmark}`, leftMargin, yPosition, { fontSize: 7 });
            yPosition += 3;
        }

        yPosition += 3;

        // ===== ORDER ITEMS =====
        doc.line(leftMargin, yPosition, rightMargin, yPosition);
        yPosition += 4;

        addText('ORDER ITEMS', leftMargin, yPosition, {
            fontSize: 9,
            fontStyle: 'bold'
        });
        yPosition += 5;

        // Check if any item has MRP
        const hasAnyMRP = order.items.some(item => item.mrp && item.mrp > item.display_price);

        // Table header background - draw rectangle first
        doc.setFillColor(240, 240, 240);
        doc.rect(leftMargin, yPosition - 4, rightMargin - leftMargin, 7, 'F');

        // Table header text
        addText('Item', leftMargin + 1, yPosition, { fontStyle: 'bold', fontSize: 7 });
        addText('Qty', rightMargin - (hasAnyMRP ? 135 : 95), yPosition, { fontStyle: 'bold', fontSize: 7 });
        if (hasAnyMRP) {
            addText('MRP', rightMargin - 85, yPosition, { fontStyle: 'bold', fontSize: 6 });
        }
        addText('Price', rightMargin - (hasAnyMRP ? 55 : 45), yPosition, { fontStyle: 'bold', fontSize: 7 });
        addText('Subtotal', rightMargin - 2, yPosition, { fontStyle: 'bold', fontSize: 7, align: 'right' });
        yPosition += 7;

        // Items
        order.items.forEach((item) => {
            // Calculate item savings
            const hasMrpDiscount = item.mrp && item.mrp > item.display_price;
            const mrpSavings = hasMrpDiscount ? (item.mrp - item.display_price) * item.quantity : 0;
            const discountPercentage = hasMrpDiscount ? ((item.mrp - item.display_price) / item.mrp * 100) : 0;

            // Product name
            const productName = item.product_name.length > 20
                ? item.product_name.substring(0, 20) + '.'
                : item.product_name;
            addText(productName, leftMargin + 1, yPosition, { fontSize: 7 });

            // Quantity
            addText(item.quantity.toString(), rightMargin - (hasAnyMRP ? 135 : 95), yPosition, { fontSize: 7 });

            // MRP (if available)
            if (hasAnyMRP) {
                if (hasMrpDiscount) {
                    setTextColor(128, 128, 128);
                    doc.setFontSize(6);
                    const mrpText = `${item.mrp}`;
                    const mrpX = rightMargin - 85;
                    addText(mrpText, mrpX, yPosition);
                    const textWidth = doc.getTextWidth(mrpText);
                    doc.line(mrpX, yPosition - 1.5, mrpX + textWidth, yPosition - 1.5);
                    resetColor();
                    doc.setFontSize(9);
                } else {
                    doc.setFontSize(6);
                    addText('-', rightMargin - 85, yPosition);
                    doc.setFontSize(9);
                }
            }

            // Price
            addText(`${item.display_price}`, rightMargin - (hasAnyMRP ? 55 : 45), yPosition, { fontSize: 7 });

            // Subtotal
            addText(`${item.item_subtotal}`, rightMargin - 2, yPosition, { align: 'right', fontSize: 7 });
            yPosition += 4;

            // Size and color (if available)
            if (item.size || item.color) {
                const details = [];
                if (item.size) details.push(`S: ${item.size}`);
                if (item.color) details.push(`C: ${item.color}`);
                addText(`(${details.join(', ')})`, leftMargin + 1, yPosition, { fontSize: 6 });
                yPosition += 3;
            }

            // Savings info (if MRP discount)
            if (hasMrpDiscount) {
                setTextColor(0, 128, 0);
                addText(
                    `Save: Rs. ${mrpSavings.toFixed(0)} (${discountPercentage.toFixed(0)}%)`,
                    leftMargin + 1,
                    yPosition,
                    { fontSize: 6 }
                );
                resetColor();
                yPosition += 2;
            }

            yPosition += 2;
        });

        yPosition += 2;

        // ===== PAYMENT SUMMARY =====
        doc.setLineWidth(0.2);
        doc.line(leftMargin, yPosition, rightMargin, yPosition);
        yPosition += 4;

        addText('PAYMENT SUMMARY', leftMargin, yPosition, {
            fontSize: 9,
            fontStyle: 'bold'
        });
        yPosition += 5;

        // Calculate totals
        let totalMRP = 0;
        let totalMrpSavings = 0;

        order.items.forEach(item => {
            if (item.mrp && item.mrp > item.display_price) {
                totalMRP += item.mrp * item.quantity;
                totalMrpSavings += (item.mrp - item.display_price) * item.quantity;
            } else {
                totalMRP += item.display_price * item.quantity;
            }
        });

        // Convert coupon_discount to number to prevent toFixed error
        const couponDiscount = Number(order.coupon_discount) || 0;
        const hasCoupon = order.coupon_code && couponDiscount > 0;
        const hasAnySavings = totalMrpSavings > 0 || hasCoupon;

        // Total MRP
        addText('Total MRP:', rightMargin - 85, yPosition, { fontSize: 7 });
        if (totalMrpSavings > 0) {
            setTextColor(128, 128, 128);
            const mrpText = `Rs. ${totalMRP.toFixed(2)}`;
            const mrpX = rightMargin;
            addText(mrpText, mrpX, yPosition, { align: 'right', fontSize: 7 });
            const textWidth = doc.getTextWidth(mrpText);
            doc.line(mrpX - textWidth - 1, yPosition - 1, mrpX, yPosition - 1);
            resetColor();
        } else {
            addText(`Rs. ${totalMRP.toFixed(2)}`, rightMargin, yPosition, { align: 'right', fontSize: 7 });
        }
        yPosition += 4;

        // Product Discount (MRP Savings)
        if (totalMrpSavings > 0) {
            setTextColor(0, 128, 0);
            addText('Product Discount:', rightMargin - 85, yPosition, { fontSize: 7 });
            addText(`-Rs. ${totalMrpSavings.toFixed(2)}`, rightMargin, yPosition, { align: 'right', fontSize: 7 });
            resetColor();
            yPosition += 4;
        }

        // Items Total
        addText('Items Total:', rightMargin - 85, yPosition, { fontSize: 7 });
        addText(`Rs. ${order.subtotal}`, rightMargin, yPosition, { align: 'right', fontSize: 7 });
        yPosition += 4;

        // Coupon Discount
        if (hasCoupon) {
            setTextColor(0, 128, 0);
            addText('Coupon Discount:', rightMargin - 85, yPosition, { fontSize: 7 });
            addText(`-Rs. ${couponDiscount.toFixed(2)}`, rightMargin, yPosition, { align: 'right', fontSize: 7 });
            resetColor();
            yPosition += 4;
        }

        // Delivery Fee
        addText('Delivery Fee:', rightMargin - 85, yPosition, { fontSize: 7 });
        if (order.cod_fee > 0) {
            addText(`Rs. ${order.cod_fee}`, rightMargin, yPosition, { align: 'right', fontSize: 7 });
        } else {
            setTextColor(0, 128, 0);
            addText('FREE', rightMargin, yPosition, { align: 'right', fontSize: 7 });
            resetColor();
        }
        yPosition += 5;

        // Total Savings Box - IMPROVED SPACING
        if (hasAnySavings) {
            const totalSavings = totalMrpSavings + (hasCoupon ? couponDiscount : 0);

            // Draw background rectangle with proper height and padding
            doc.setFillColor(200, 255, 200);
            doc.rect(leftMargin, yPosition - 3, rightMargin - leftMargin, 8, 'F');

            setTextColor(0, 100, 0);
            addText('Total Savings:', rightMargin - 85, yPosition + 1, { fontStyle: 'bold', fontSize: 7 });
            addText(`Rs. ${totalSavings.toFixed(2)}`, rightMargin, yPosition + 1, {
                fontStyle: 'bold',
                align: 'right',
                fontSize: 7
            });
            resetColor();
            yPosition += 9;
        }

        // Total divider
        doc.setLineWidth(0.4);
        doc.line(rightMargin - 105, yPosition, rightMargin, yPosition);
        yPosition += 4;

        // Total Amount
        addText('TOTAL:', rightMargin - 85, yPosition, {
            fontSize: 10,
            fontStyle: 'bold'
        });
        addText(`Rs. ${order.total_amount}`, rightMargin, yPosition, {
            fontSize: 10,
            fontStyle: 'bold',
            align: 'right'
        });
        yPosition += 7;

        // Payment method box - IMPROVED SPACING
        doc.setFillColor(230, 240, 255);
        doc.rect(leftMargin, yPosition - 3, rightMargin - leftMargin, 10, 'F');

        addText('Payment: Cash on Delivery (COD)', leftMargin + 2, yPosition, {
            fontSize: 8,
            fontStyle: 'bold'
        });
        yPosition += 4;

        const paymentText = order.payment_status === 'paid'
            ? 'Payment completed'
            : `Pay Rs. ${order.total_amount} on delivery`;
        addText(paymentText, leftMargin + 2, yPosition, { fontSize: 7 });
        yPosition += 6;

        // Coupon Applied Banner
        if (hasCoupon) {
            doc.setFillColor(255, 250, 205);
            doc.setDrawColor(255, 193, 7);
            doc.setLineWidth(0.3);
            doc.rect(leftMargin, yPosition - 2, rightMargin - leftMargin, 7, 'FD');

            setTextColor(184, 134, 11);
            const couponText = `Coupon: ${order.coupon_code} - Saved Rs. ${couponDiscount.toFixed(2)}`;
            addText(couponText, leftMargin + 2, yPosition + 1, { fontSize: 6, fontStyle: 'bold' });
            resetColor();
            yPosition += 8;
        }

        // ===== SHOP DETAILS =====
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(leftMargin, yPosition, rightMargin, yPosition);
        yPosition += 4;

        addText('SHOP DETAILS', leftMargin, yPosition, {
            fontSize: 9,
            fontStyle: 'bold'
        });
        yPosition += 4;

        addText(`${order.shop_name}`, leftMargin, yPosition, { fontSize: 7 });
        yPosition += 3;

        if (order.shop_contact) {
            addText(`Contact: ${order.shop_contact}`, leftMargin, yPosition, { fontSize: 7 });
            yPosition += 3;
        }

        yPosition += 3;

        // ===== FOOTER =====
        const footerY = pageHeight - 15;

        doc.setLineWidth(0.3);
        doc.line(leftMargin, footerY - 2, rightMargin, footerY - 2);

        addText('Thank you for shopping!', pageWidth / 2, footerY + 1, {
            fontSize: 8,
            fontStyle: 'bold',
            align: 'center'
        });

        addText('Amravati Wears Market', pageWidth / 2, footerY + 5, {
            fontSize: 7,
            align: 'center'
        });

        // Save the PDF
        const fileName = `Invoice_${order.order_number}.pdf`;
        doc.save(fileName);
    } catch (error) {
        console.error('Error generating invoice:', error);
        throw error;
    }
};

export default generateInvoice;
