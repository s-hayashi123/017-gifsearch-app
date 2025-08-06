export default async function handler(req, res) {
  const { q, offset = 0, limit = 25 } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${
        process.env.GIPHY_API_KEY
      }&q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error(`Giphy API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Failed to fetch GIFs" });
  }
}
