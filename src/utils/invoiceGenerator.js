import jsPDF from 'jspdf';

/**
 * Generate and download a PDF invoice for an order
 * @param {Object} order - The order object containing all order details
 */
export const generateInvoice = (order) => {
    // Create new PDF document (A4 size)
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Helper function to add text with automatic line wrapping
    const addText = (text, x, y, options = {}) => {
        doc.setFontSize(options.fontSize || 10);
        doc.setFont(options.font || 'helvetica', options.fontStyle || 'normal');
        if (options.align === 'center') {
            doc.text(text, x, y, { align: 'center' });
        } else if (options.align === 'right') {
            doc.text(text, x, y, { align: 'right' });
        } else {
            doc.text(text, x, y);
        }
    };

    // ===== HEADER =====
    // Company Name
    addText('AMRAVATI WEARS MARKET', pageWidth / 2, yPosition, {
        fontSize: 20,
        fontStyle: 'bold',
        align: 'center'
    });
    yPosition += 8;

    // Tagline
    addText('Your Local Clothing Marketplace', pageWidth / 2, yPosition, {
        fontSize: 10,
        align: 'center'
    });
    yPosition += 10;

    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 10;

    // ===== INVOICE TITLE =====
    addText('INVOICE', pageWidth / 2, yPosition, {
        fontSize: 16,
        fontStyle: 'bold',
        align: 'center'
    });
    yPosition += 10;

    // ===== ORDER DETAILS =====
    addText(`Order #: ${order.order_number}`, 15, yPosition, { fontStyle: 'bold' });
    yPosition += 6;

    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    addText(`Date: ${orderDate}`, 15, yPosition);
    yPosition += 6;

    addText(`Status: ${order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}`, 15, yPosition);
    yPosition += 10;

    // ===== CUSTOMER DETAILS =====
    doc.setLineWidth(0.3);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    addText('CUSTOMER DETAILS', 15, yPosition, {
        fontSize: 12,
        fontStyle: 'bold'
    });
    yPosition += 8;

    addText(`Name: ${order.customer_name}`, 15, yPosition);
    yPosition += 6;

    addText(`Phone: ${order.customer_phone}`, 15, yPosition);
    yPosition += 6;

    // Address (with wrapping for long addresses)
    const addressLines = doc.splitTextToSize(
        `Address: ${order.delivery_address}, ${order.city} - ${order.pincode}`,
        pageWidth - 30
    );
    addressLines.forEach(line => {
        addText(line, 15, yPosition);
        yPosition += 6;
    });

    if (order.landmark) {
        addText(`Landmark: ${order.landmark}`, 15, yPosition);
        yPosition += 6;
    }

    yPosition += 4;

    // ===== ORDER ITEMS =====
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    addText('ORDER ITEMS', 15, yPosition, {
        fontSize: 12,
        fontStyle: 'bold'
    });
    yPosition += 8;

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');

    addText('Item', 17, yPosition, { fontStyle: 'bold' });
    addText('Qty', pageWidth - 80, yPosition, { fontStyle: 'bold' });
    addText('Price', pageWidth - 60, yPosition, { fontStyle: 'bold' });
    addText('Subtotal', pageWidth - 30, yPosition, { fontStyle: 'bold', align: 'right' });
    yPosition += 8;

    // Items
    order.items.forEach((item, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        // Product name
        const productName = item.product_name.length > 30
            ? item.product_name.substring(0, 30) + '...'
            : item.product_name;
        addText(productName, 17, yPosition);

        // Quantity
        addText(item.quantity.toString(), pageWidth - 80, yPosition);

        // Price
        addText(`₹${item.display_price}`, pageWidth - 60, yPosition);

        // Subtotal
        addText(`₹${item.item_subtotal}`, pageWidth - 17, yPosition, { align: 'right' });
        yPosition += 6;

        // Size and color (if available)
        if (item.size || item.color) {
            const details = [];
            if (item.size) details.push(`Size: ${item.size}`);
            if (item.color) details.push(`Color: ${item.color}`);
            addText(`(${details.join(', ')})`, 17, yPosition, { fontSize: 8 });
            yPosition += 6;
        }

        yPosition += 2;
    });

    yPosition += 4;

    // ===== PAYMENT SUMMARY =====
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    addText('PAYMENT SUMMARY', 15, yPosition, {
        fontSize: 12,
        fontStyle: 'bold'
    });
    yPosition += 8;

    // Items Total
    addText('Items Total:', pageWidth - 80, yPosition);
    addText(`₹${order.subtotal}`, pageWidth - 17, yPosition, { align: 'right' });
    yPosition += 6;

    // COD Fee
    addText('COD Fee:', pageWidth - 80, yPosition);
    addText(order.cod_fee > 0 ? `₹${order.cod_fee}` : 'FREE', pageWidth - 17, yPosition, { align: 'right' });
    yPosition += 8;

    // Total (highlighted)
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 85, yPosition - 2, pageWidth - 15, yPosition - 2);

    addText('TOTAL:', pageWidth - 80, yPosition, {
        fontSize: 12,
        fontStyle: 'bold'
    });
    addText(`₹${order.total_amount}`, pageWidth - 17, yPosition, {
        fontSize: 12,
        fontStyle: 'bold',
        align: 'right'
    });
    yPosition += 10;

    // Payment method
    doc.setFillColor(230, 240, 255);
    doc.rect(15, yPosition - 5, pageWidth - 30, 12, 'F');
    addText('Payment Method: Cash on Delivery', 17, yPosition);
    yPosition += 6;
    addText(
        order.payment_status === 'paid'
            ? 'Payment completed'
            : `Pay ₹${order.total_amount} when you receive the order`,
        17,
        yPosition,
        { fontSize: 9 }
    );
    yPosition += 10;

    // ===== SHOP DETAILS =====
    doc.setLineWidth(0.3);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;

    addText('SHOP DETAILS', 15, yPosition, {
        fontSize: 12,
        fontStyle: 'bold'
    });
    yPosition += 8;

    addText(`Shop Name: ${order.shop_name}`, 15, yPosition);
    yPosition += 6;

    if (order.shop_contact) {
        addText(`Contact: ${order.shop_contact}`, 15, yPosition);
        yPosition += 6;
    }

    yPosition += 10;

    // ===== FOOTER =====
    addText('Thank you for shopping with us!', pageWidth / 2, yPosition, {
        fontSize: 10,
        fontStyle: 'italic',
        align: 'center'
    });

    // Save the PDF
    const fileName = `Invoice_${order.order_number}.pdf`;
    doc.save(fileName);
};

export default generateInvoice;
