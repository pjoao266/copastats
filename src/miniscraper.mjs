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
const SEASON_ID = 41087;
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

async function getMatches() {
    let page = 0;
    const validMatches = [];
    console.log("Buscando jogos...");
    while (true) {
        const url = `https://api.sofascore.com/api/v1/unique-tournament/${TOURNAMENT_ID}/season/${SEASON_ID}/events/last/${page}`;
        try {
            let roundStage = ''
            let round = ''
            const data = await fetchJson(url);
            for (const ev of data.events || []) {
                const statusDesc = ev.status?.description;
                if (statusDesc !== 'Not started') {
                    
                    let roundInfo = ev.roundInfo
                    if(roundInfo?.name && roundInfo?.name !== '') {
                        round = roundInfo?.name
                        roundStage = 'Fase Eliminatória'
                    }else{
                        roundStage = 'Fase de Grupos'
                        round = `${roundInfo.round}ª rodada`
                    }
                    
                    validMatches.push({
                        match_id: ev.id,
                        home: ev.homeTeam?.name,
                        away: ev.awayTeam?.name,
                        home_score: ev.homeScore?.current || 0,
                        away_score: ev.awayScore?.current || 0,
                        status: statusDesc,
                        round: round,
                        roundStage: roundStage
                    });
                }
            }
            if (!data.hasNextPage) break;
            page++;
        } catch (e) {
            break;
        }
    }
    return validMatches;
}


const jsonPath = path.join(DADOS_DIR, '15186731_lineups.json');
const lineupsData = await getMatches();
await fs.writeFile(jsonPath, JSON.stringify(lineupsData, null, 2), 'utf-8');