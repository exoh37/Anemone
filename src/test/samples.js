const fs = require("fs");
const sampleXML = "./sample/books.xml";

function getSampleInvoice() {
    return fs.readFileSync(require.resolve(sampleXML), "utf8");
}

module.exports = { getSampleInvoice };