const puppeteer = require('puppeteer');
const ObjectsToCsv = require('objects-to-csv');
const googleMapsClient = require('@google/maps').createClient({
    key: 'YOUR_KEY',
    Promise: Promise
});

async function getData() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const url = `https://www.zapimoveis.com.br/venda/imoveis/sc+joinville++costa-e-silva/?onde=,Santa%20Catarina,Joinville,,Costa%20E%20Silva,,,neighborhood,BR%3ESanta%20Catarina%3ENULL%3EJoinville%3EBarrios%3ECosta%20E%20Silva,-26.274768,-48.854485%3B,Santa%20Catarina,Joinville,,Sagua%C3%A7%C3%BA,,,neighborhood,BR%3ESanta%20Catarina%3ENULL%3EJoinville%3EBarrios%3ESaguacu,-26.271418,-48.822472%3B,Santa%20Catarina,Joinville,,Am%C3%A9rica,,,neighborhood,BR%3ESanta%20Catarina%3ENULL%3EJoinville%3EBarrios%3EAmerica,-26.284252,-48.850051%3B,Santa%20Catarina,Joinville,,Bom%20Retiro,,,neighborhood,BR%3ESanta%20Catarina%3ENULL%3EJoinville%3EBarrios%3EBom%20Retiro,-26.283145,-48.840876%3B,Santa%20Catarina,Joinville,,Floresta,,,neighborhood,BR%3ESanta%20Catarina%3ENULL%3EJoinville%3EBarrios%3EFloresta,-26.337835,-48.847484&transacao=Venda&tipo=Im%C3%B3vel%20usado`;
    const data = [];
    
    let count = 1;
    
    await page.goto(url);
    await page.waitForSelector('.gutter-top-double.simple-card__box');

    while(count < 10) {
        count++;

        const result = await page.$$eval('.gutter-top-double.simple-card__box', response => {
            return response.map(item => {
                const price = item.querySelector('.simple-card__price.js-price');
                const address = item.querySelector('.simple-card__address');
                const area = item.querySelector('.simple-card .js-areas');
                const bedrooms = item.querySelector('.simple-card .js-bedrooms');
                const parkingSpaces = item.querySelector('.simple-card .js-parking-spaces');
                const bathrooms = item.querySelector('.simple-card .js-bathrooms');

                return prop = {
                    price: price ? price.innerText : 'Não definido',
                    address: address ? decodeURI(address.innerText) : 'Não definido',
                    area: area ? area.innerText.match(/\d+/g)[0] : 'Não definido',
                    bedrooms: bedrooms ? bedrooms.innerText.match(/\d+/g)[0] : 'Não definido',
                    parkingSpaces: parkingSpaces ? parkingSpaces.innerText.match(/\d+/g)[0] : 'Não definido',
                    bathrooms: bathrooms ? bathrooms.innerText : 'Não definido'
                };
            });
        });

        data.push(...result);
       
        await page.click(`a[href='?pagina=${count}`);
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 0 });
    }

   async function resolvePromisseGeocode(address) {
        return googleMapsClient.geocode({address: address}).asPromise().then(response => response.json.results[0]);
    }

    const latAndLong = [];
    data.forEach(item => {
        latAndLong.push(resolvePromisseGeocode(item.address));
    });

    Promise.all(latAndLong).then(response => {
        response.map((item, index) => {
            if (item) {
                data[index].lat = item.geometry.location.lat.toString();
                data[index].lng = item.geometry.location.lng.toString();
            }
        });
        
        const csv = new ObjectsToCsv(data);

        csv.toDisk('./data.csv');
        
   });

    await browser.close();
}

getData();
