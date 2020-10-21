const puppeteer = require('puppeteer');
const ObjectsToCsv = require('objects-to-csv');

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
                const prop = {};
                const price = item.querySelector('.simple-card__price.js-price');
                const address = item.querySelector('.simple-card__address');
                
                if (price && address) {
                    prop.price = price.innerText;
                    prop.adress = address.innerText;
                }

                return prop;
            });
        });

        data.push(result);
       
        await page.click(`a[href='?pagina=${count}`);
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }

    const csv = new ObjectsToCsv(teste);
    await csv.toDisk('./test.csv');
}

getData();
