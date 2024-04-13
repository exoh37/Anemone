async function test() {
    const client = await pool.connect();
    try {
        const invoices = await client.query("SELECT * FROM invoices");
        console.log(invoices.rows);
    } catch (error) {
        console.error("Failed to retrieve invoice:", error);
        throw error;
    } finally {
        client.release();
    }
}

test()