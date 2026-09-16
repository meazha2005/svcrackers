import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, Category } from './types';

export async function generatePriceListPDF(products: Product[], categories: Category[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  // Palette Colors
  const navyColor: [number, number, number] = [11, 37, 90]; // #0b255a
  const goldColor: [number, number, number] = [245, 158, 11]; // #f59e0b
  const darkSlate: [number, number, number] = [30, 41, 59];
  const redColor: [number, number, number] = [185, 28, 28]; // #b91c1c

  // Function to draw header banner on top of pages
  const drawHeader = (pageNum: number) => {
    // Top Color Stripe
    doc.setFillColor(...navyColor);
    doc.rect(0, 0, pageWidth, 6, 'F');
    doc.setFillColor(...goldColor);
    doc.rect(0, 6, pageWidth, 1.5, 'F');

    if (pageNum === 1) {
      // Store Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...navyColor);
      doc.text('SRI VINAYAGA CRACKERS', pageWidth / 2, 15, { align: 'center' });

      // Subtitle Banner
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...goldColor);
      doc.text('SIVAKASI DIRECT WHOLESALE FIREWORKS PRICE LIST 2026', pageWidth / 2, 20.5, { align: 'center' });

      // Store Details & Contact
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...darkSlate);
      doc.text(
        'D/No: 229, Subramaniyapuram (Near Ruby Sparklers), Sivakasi Taluk, Virudhunagar Dist., Tamilnadu - 626128',
        pageWidth / 2,
        25,
        { align: 'center' }
      );
      doc.text(
        'Phone / WhatsApp: +91 9566383227, 7780967465  |  Email: srivinayagacrackers26@gmail.com',
        pageWidth / 2,
        29,
        { align: 'center' }
      );

      // Separator Line
      doc.setDrawColor(...goldColor);
      doc.setLineWidth(0.4);
      doc.line(10, 31.5, pageWidth - 10, 31.5);
    } else {
      // Minimal Header for Page 2+
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...navyColor);
      doc.text('SRI VINAYAGA CRACKERS, SIVAKASI — WHOLESALE PRICE LIST 2026', 10, 13);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...darkSlate);
      doc.text('Ph: 9566383227 / 7780967465', pageWidth - 10, 13, { align: 'right' });
      doc.setDrawColor(...goldColor);
      doc.setLineWidth(0.4);
      doc.line(10, 15, pageWidth - 10, 15);
    }
  };

  // Group active products by category name
  const activeProducts = products.filter((p) => p.is_active !== 0);
  const grouped: Record<string, Product[]> = {};
  activeProducts.forEach((p) => {
    const catName = p.category_name || 'General Crackers';
    if (!grouped[catName]) grouped[catName] = [];
    grouped[catName].push(p);
  });

  // Sort category keys by natural numerical prefix
  const sortedCategories = Object.keys(grouped).sort((catA, catB) => {
    const numA = parseInt(catA) || 0;
    const numB = parseInt(catB) || 0;
    if (numA !== numB) return numA - numB;
    return catA.localeCompare(catB, undefined, { numeric: true });
  });

  let startY = 34;
  let overallSNo = 1;

  // Draw Header for Page 1
  drawHeader(1);

  for (const catName of sortedCategories) {
    const catProducts = grouped[catName];
    if (!catProducts || catProducts.length === 0) continue;

    // Build Table Body Rows
    const tableData = catProducts.map((p) => {
      const mrp = Number(p.mrp_rate);
      const discounted = p.discounted_rate ? Number(p.discounted_rate) : mrp;
      const unit = p.unit_symbol || p.unit_name || 'BOX';
      const sNoStr = String(overallSNo++);

      return [
        sNoStr,
        p.name,
        unit,
        `Rs. ${mrp.toFixed(2)}`,
        `Rs. ${discounted.toFixed(2)}`
      ];
    });

    // Render AutoTable for this Category
    autoTable(doc, {
      startY,
      margin: { top: 18, left: 10, right: 10, bottom: 14 },
      head: [
        [
          {
            content: `CATEGORY: ${catName.toUpperCase()} (${catProducts.length} ITEMS)`,
            colSpan: 5,
            styles: {
              fillColor: navyColor,
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 8.5,
              halign: 'left'
            }
          }
        ],
        ['S.No', 'Product Name', 'Unit', 'MRP Rate', 'Net Discount Price']
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: darkSlate,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        lineWidth: 0.15,
        lineColor: [203, 213, 225]
      },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 28, halign: 'right', textColor: [100, 116, 139] },
        4: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: redColor }
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 1.5,
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      didDrawPage: (data) => {
        // When autoTable moves to a new page, redraw page header
        if (data.pageNumber > 1) {
          drawHeader(data.pageNumber);
        }
      }
    });

    // Update startY for next category block
    startY = (doc as any).lastAutoTable.finalY + 4;
  }

  // Add Page Numbers & Footers across all generated pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);

    // Footer Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(10, pageHeight - 10, pageWidth - 10, pageHeight - 10);

    // Left Footer Info
    doc.text(
      'SRI VINAYAGA CRACKERS — Direct Factory Wholesale Price List 2026',
      10,
      pageHeight - 5
    );

    // Right Footer Page Number
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 10, pageHeight - 5, { align: 'right' });
  }

  // Save and trigger PDF download
  doc.save('Sri_Vinayaga_Crackers_Price_List_2026.pdf');
}
