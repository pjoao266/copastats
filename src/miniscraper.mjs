import { gotScraping } from 'got-scraping';
import fs from 'fs/promises';
import path from 'path';

//const HEADERS = { "x-requested-with": "4d5955" };
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://www.sofascore.com/",
    "Origin": "https://www.sofascore.com",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
    "Cache-Control": "max-age=0",
    "x-requested-with": "4d5955"
};
const DADOS_DIR = "dados";
const TOURNAMENT_ID = 16;
const SEASON_ID = 58210;

async function fetchJson(url) {
    // Tenta ler o proxy configurado no GitHub Actions. Se não houver, roda sem proxy (local)
    const proxyUrl = process.env.PROXY_URL || undefined;
    const response = await gotScraping({
        url: url,
        headers: HEADERS,
        responseType: 'json',
        proxyUrl: proxyUrl // <--- O got-scraping usa o proxy através desta propriedade
    });
    return response.body;
}
const jsonPath = path.join(DADOS_DIR, '15186731_lineups.json');
const lineupsData = await fetchJson(`https://api.sofascore.com/api/v1/event/15186731/lineups`);
await fs.writeFile(jsonPath, JSON.stringify(lineupsData, null, 2), 'utf-8');