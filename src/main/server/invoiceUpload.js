const fs = require('fs');


export function uploadfile(file) {

        // this is for merging data
        try{
                const data = JSON.parse(file);
                const invoiceId = Date.now();
                const jsonData = fs.readFileSync('TEMP_invoiceStorage.json');
                const existingData = JSON.parse(jsonData);
        
                existingData.push(data);
        
                fs.writeFileSync('TEMP_invoiceStorage.json', JSON.stringify(existingData, null, 2));

                return invoiceId;
        }

        catch (error) {
                throw new Error("Error uploading file: "+ error.message);
        }      
}