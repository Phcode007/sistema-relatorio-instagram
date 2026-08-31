export default async function handler(req, res) {
  const { metric, period, since, until, endpoint } = req.query;
  const TOKEN = process.env.META_ACCESS_TOKEN;
  const USER_ID = process.env.IG_USER_ID;

  if (!TOKEN || !USER_ID) {
    return res.status(500).json({ error: 'Token não configurado' });
  }

  let url;
  if (endpoint === 'media') {
    url = `https://graph.facebook.com/v18.0/${USER_ID}/media?fields=id,caption,media_type,media_product_type,timestamp,like_count,comments_count,permalink&limit=100&access_token=${TOKEN}`;
  } else {
    url = `https://graph.facebook.com/v18.0/${USER_ID}/insights?metric=${metric || 'impressions,reach'}&period=${period || 'day'}&since=${since}&until=${until}&access_token=${TOKEN}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro na Meta API' });
  }
}