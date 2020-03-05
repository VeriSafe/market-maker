import * as fs from 'fs';
import fetch from 'node-fetch';

const zeroxTrackerApi = 'https://api.0xtracker.com';

export const get0xTraders = async () => {
    const traders = new Set<string>();
    for (let index = 1; index < 47; index++) {
        const apiResponse = await fetch(`${zeroxTrackerApi}/traders?statsPeriod=month&page=${index}&limit=50`);
        const jsonResponse = await apiResponse.json();
        const addresses = jsonResponse.traders.map((t: any) => t.address) as string[];
        for (const address of addresses) {
            traders.add(address);
        }
    }
    const tradersString = JSON.stringify([...traders]);
    fs.writeFile(`files/0xtraders.json`, tradersString, 'utf8', (err: any) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
};

get0xTraders();
