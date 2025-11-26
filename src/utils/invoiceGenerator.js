import jsPDF from 'jspdf';

/**
 * Generate and download a PDF invoice for an order
 * @param {Object} order - The order object containing all order details
 */
export const generateInvoice = (order) => {
    // Create new PDF document (A4 size)
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const leftMargin = 15;
    const rightMargin = pageWidth - 15;
    let yPosition = 20;

    // Helper function to add text
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

    // Check if new page is needed
    const checkNewPage = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
        }
    };

    // ===== HEADER =====
    addText('AMRAVATI WEARS MARKET', pageWidth / 2, yPosition, {
        fontSize: 20,
        fontStyle: 'bold',
        align: 'center'
    });
    yPosition += 8;

    addText('Your Local Clothing Marketplace', pageWidth / 2, yPosition, {
        fontSize: 10,
        align: 'center'
    });
    yPosition += 10;

    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPosition, rightMargin, yPosition);
    yPosition += 10;

    // ===== INVOICE TITLE =====
    addText('INVOICE', pageWidth / 2, yPosition, {
        fontSize: 16,
        fontStyle: 'bold',
        align: 'center'
    });
    yPosition += 10;

    // ===== ORDER DETAILS =====
    addText(`Order #: ${order.order_number}`, leftMargin, yPosition, { 
        fontStyle: 'bold' 
    });
    yPosition += 6;

    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    addText(`Date: ${orderDate}`, leftMargin, yPosition);
    yPosition += 6;

    const statusLabel = order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1);
    addText(`Status: ${statusLabel}`, leftMargin, yPosition);
    yPosition += 10;

    // ===== CUSTOMER DETAILS =====
    checkNewPage(40);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, yPosition, rightMargin, yPosition);
    yPosition += 8;

    addText('CUSTOMER DETAILS', leftMargin, yPosition, {
        fontSize: 12,
        fontStyle: 'bold'
    });
    yPosition += 8;

    addText(`Name: ${order.customer_name}`, leftMargin, yPosition);
    yPosition += 6;

    addText(`Phone: ${order.customer_phone}`, leftMargin, yPosition);
    yPosition += 6;

    // Address (with wrapping for long addresses)
    const addressText = `Address: ${order.delivery_address}, ${order.city} - ${order.pincode}`;
    const addressLines = doc.splitTextToSize(addressText, pageWidth - 30);
    addressLines.forEach(line => {
        addText(line, leftMargin, yPosition);
        yPosition += 6;
    });

    if (order.landmark) {
        addText(`Landmark: ${order.landmark}`, leftMargin, yPosition);
        yPosition += 6;
    }

    yPosition += 4;

    // ===== ORDER ITEMS =====
    checkNewPage(50);
    doc.line(leftMargin, yPosition, rightMargin, yPosition);
    yPosition += 8;

    addText('ORDER ITEMS', leftMargin, yPosition, {
        fontSize: 12,
        fontStyle: 'bold'
    });
    yPosition += 8;

    // Table header background
    doc.setFillColor(240, 240, 240);
    doc.rect(leftMargin, yPosition - 5, rightMargin - leftMargin, 8, 'F');

    // Table header text
    addText('Item', leftMargin + 2, yPosition, { fontStyle: 'bold' });
    addText('Qty', rightMargin - 115, yPosition, { fontStyle: 'bold' });
    addText('Price', rightMargin - 65, yPosition, { fontStyle: 'bold' });
    addText('Subtotal', rightMargin, yPosition, { fontStyle: 'bold', align: 'right' });
    yPosition += 8;

    // Items
    order.items.forEach((item) => {
        checkNewPage(20);

        // Product name
        const productName = item.product_name.length > 30
            ? item.product_name.substring(0, 30) + '...'
            : item.product_name;
        addText(productName, leftMargin + 2, yPosition);

        // Quantity
        addText(item.quantity.toString(), rightMargin - 115, yPosition);

        // Price
        addText(`Rs. ${item.display_price}`, rightMargin - 65, yPosition);

        // Subtotal
        addText(`Rs. ${item.item_subtotal}`, rightMargin, yPosition, { align: 'right' });
        yPosition += 6;

        // Size and color (if available)
        if (item.size || item.color) {
            const details = [];
            if (item.size) details.push(`Size: ${item.size}`);
            if (item.color) details.push(`Color: ${item.color}`);
            addText(`(${details.join(', ')})`, leftMargin + 2, yPosition, { fontSize: 8 });
            yPosition += 6;
        }

        yPosition += 2;

        // Divider line
        doc.setLineWidth(0.3);
        doc.line(leftMargin, yPosition, rightMargin, yPosition);
        yPosition += 2;
    });

    yPosition += 4;

    // ===== PAYMENT SUMMARY =====
    checkNewPage(60);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, yPosition, rightMargin, yPosition);
    yPosition += 8;

    addText('PAYMENT SUMMARY', leftMargin, yPosition, {
        fontSize: 12,
        fontStyle: 'bold'
    });
    yPosition += 8;

    // Items Total
    addText('Items Total:', rightMargin - 120, yPosition);
    addText(`Rs. ${order.subtotal}`, rightMargin, yPosition, { align: 'right' });
    yPosition += 6;

    // COD Fee
    addText('COD Fee:', rightMargin - 120, yPosition);
    addText(
        order.cod_fee > 0 ? `Rs. ${order.cod_fee}` : 'FREE',
        rightMargin, 
        yPosition, 
        { align: 'right' }
    );
    yPosition += 8;

    // Total divider
    doc.setLineWidth(0.5);
    doc.line(rightMargin - 125, yPosition - 2, rightMargin, yPosition - 2);
    yPosition += 5;

    // Total
    addText('TOTAL:', rightMargin - 120, yPosition, {
        fontSize: 12,
        fontStyle: 'bold'
    });
    addText(`Rs. ${order.total_amount}`, rightMargin, yPosition, {
        fontSize: 12,
        fontStyle: 'bold',
        align: 'right'
    });
    yPosition += 10;

    // Payment method box
    doc.setFillColor(230, 240, 255);
    doc.rect(leftMargin, yPosition - 5, rightMargin - leftMargin, 12, 'F');
    
    addText('Payment Method: Cash on Delivery', leftMargin + 2, yPosition);
    yPosition += 6;
    
    const paymentText = order.payment_status === 'paid'
        ? 'Payment completed'
        : `Pay ₹${order.total_amount} when you receive the order`;
    addText(paymentText, leftMargin + 2, yPosition, { fontSize: 9 });
    yPosition += 10;

    // ===== SHOP DETAILS =====
    checkNewPage(30);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, yPosition, rightMargin, yPosition);
    yPosition += 8;

    addText('SHOP DETAILS', leftMargin, yPosition, {
        fontSize: 12,
        fontStyle: 'bold'
    });
    yPosition += 8;

    addText(`Shop Name: ${order.shop_name}`, leftMargin, yPosition);
    yPosition += 6;

    if (order.shop_contact) {
        addText(`Contact: ${order.shop_contact}`, leftMargin, yPosition);
        yPosition += 6;
    }

    yPosition += 10;

    // ===== FOOTER =====
    // Position footer at bottom if space available
    const footerY = Math.max(yPosition, pageHeight - 30);
    
    addText('Thank you for shopping with us!', pageWidth / 2, footerY, {
        fontSize: 10,
        fontStyle: 'italic',
        align: 'center'
    });

    // Save the PDF
    const fileName = `Invoice_${order.order_number}.pdf`;
    doc.save(fileName);
};

export default generateInvoice;