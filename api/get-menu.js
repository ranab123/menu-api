export default async function handler(req, res) {
    const sheetId = "1T8ABzd3n4D8uXxlp0yybQIhocBzJkczNNGyaChyfuRg";
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY; // Store API Key in Vercel
    const sheetNames = ["Menu Rotation A", "Menu Rotation A", "Menu Rotation A", "Menu Rotation A", "Menu Rotation A", "Menu Finals"];

    const today = new Date();
    const nextWeek = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        return date.toISOString().split("T")[0];
    });

    let fetchedMenus = [];

    try {
        for (const sheetName of sheetNames) {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;
            const response = await fetch(url);
            const result = await response.json();
            const values = result.values || [];

            if (values.length < 32) continue;

            const dateRow = values[4]; // Row 5 (index 4)

            for (let colIndex = 6; colIndex <= 10; colIndex++) {
                const dateValue = dateRow[colIndex]?.trim();
                if (nextWeek.includes(dateValue)) {
                    const lunchItems = values.slice(7, 10).map(row => row[colIndex] || "");
                    const dinnerItems = values.slice(20, 31).map(row => row[colIndex] || "");

                    fetchedMenus.push({
                        date: dateValue,
                        lunch: lunchItems.filter(Boolean).join(", "),
                        dinner: dinnerItems.filter(Boolean).join(", "),
                    });
                }
            }
        }

        res.status(200).json(fetchedMenus);
    } catch (error) {
        console.error("Error fetching menu:", error);
        res.status(500).json({ error: "Failed to fetch menu data" });
    }
}
