export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.PIPEDRIVE_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'PIPEDRIVE_TOKEN non configuré dans les variables d\'environnement Vercel.' });
  }

  const { endpoint, id, ...params } = req.query;
  if (!endpoint) {
    return res.status(400).json({ error: 'Paramètre endpoint manquant.' });
  }

  const allowed = ['deals', 'dealFields', 'persons', 'organizations', 'pipelines', 'stages'];
  if (!allowed.includes(endpoint)) {
    return res.status(400).json({ error: 'Endpoint non autorisé.' });
  }

  const queryParams = new URLSearchParams({ ...params, api_token: token });
  const path = id ? `${endpoint}/${id}` : endpoint;
  const url = `https://api.pipedrive.com/v1/${path}?${queryParams}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur lors de l\'appel à l\'API Pipedrive : ' + err.message });
  }
}
