const puppeteer = require('puppeteer');
const ObjectsToCsv = require('objects-to-csv')

async function getData(numberCall = 1) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const pagina = numberCall;
    const url = `https://www.zapimoveis.com.br/venda/imoveis/sc+joinville++costa-e-silva/?onde=,Santa%20Catarina,Joinville,,Costa%20E%20Silva,,,neighborhood,BR%3ESanta%20Catarina%3ENULL%3EJoinville%3EBarrios%3ECosta%20E%20Silva,-26.274768,-48.854485%3B,Santa%20Catarina,Joinville,,Sagua%C3%A7%C3%BA,,,neighborhood,BR%3ESanta%20Catarina%3ENULL%3EJoinville%3EBarrios%3ESaguacu,-26.271418,-48.822472%3B,Santa%20Catarina,Joinville,,Am%C3%A9rica,,,neighborhood,BR%3ESanta%20Catarina%3ENULL%3EJoinville%3EBarrios%3EAmerica,-26.284252,-48.850051%3B,Santa%20Catarina,Joinville,,Bom%20Retiro,,,neighborhood,BR%3ESanta%20Catarina%3ENULL%3EJoinville%3EBarrios%3EBom%20Retiro,-26.283145,-48.840876%3B,Santa%20Catarina,Joinville,,Floresta,,,neighborhood,BR%3ESanta%20Catarina%3ENULL%3EJoinville%3EBarrios%3EFloresta,-26.337835,-48.847484&transacao=Venda&tipo=Im%C3%B3vel%20usado&pagina=${pagina}`;

    await page.goto(url);

    const resultado = await page.evaluate(() => {
        const data = [];
        const elementRef = Array.from(document.querySelectorAll('.box--display-flex.box--flex-column.gutter-top-double.gutter-left-double.gutter-right-double.gutter-bottom-double.simple-card__box'));
        
        elementRef.map((item, index) => {
            const price = Array.from(document.querySelectorAll('.simple-card__price.js-price.heading-regular.heading-regular__bolder.align-left'))[index].textContent.trim();
            const adress = Array.from(document.querySelectorAll('.color-dark.text-regular.simple-card__address'))[index].textContent.trim();
            const size = Array.from(document.querySelectorAll('.feature__item.text-small.js-areas'))[index].textContent.trim();
            const numberOfRooms = Array.from(document.querySelectorAll('.feature__item.text-small.js-bedrooms'))[index].textContent.trim();
            const hasParkSpace = Array.from(document.querySelectorAll('.feature__item.text-small.js-parking-spaces'))[index];
            const parkSpace = hasParkSpace ? hasParkSpace.textContent.trim() : 'Nao definido';

            data.push({price, adress, size, numberOfRooms, parkSpace}); 
        });

        return data;
    });

    (async () => {
        const csv = new ObjectssToCsv(resultado);
      
        await csv.toDisk('./test.csv');
      
        console.log(await csv.toString());
      })();
}

getData();