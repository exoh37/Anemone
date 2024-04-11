const mockInvoice1 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <invoice>
        <invoiceName>Invoice 1</invoiceName>
        <amount>123.45</amount>
        <date>2024-04-08</date>
    </invoice>
`;

const mockInvoice2 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <invoice>
        <invoiceName>Invoice 2</invoiceName>
        <amount>543.21</amount>
        <date>2024-04-08</date>
    </invoice>
`;

const mockInvoice3 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <invoice>
        <invoiceName>Invoice 3</invoiceName>
        <amount>999.99</amount>
        <date>2024-05-08</date>
    </invoice>
`;

const mockInvoice4 = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <invoice>
        <invoiceName>Invoice 4</invoiceName>
        <amount>67.89</amount>
        <date>2024-04-08</date>
    </invoice>
`;

module.exports = { mockInvoice1, mockInvoice2, mockInvoice3, mockInvoice4 };