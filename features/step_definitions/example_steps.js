const puppeteer = require('puppeteer');
const { Before, After, Given, When, Then } = require('@cucumber/cucumber');
const commands = require('../../lib/commands');
//const expect = require('chai'); // если расскомментировать - падает с ошибкой 


let browser;
let page;
const pageStart = "https://qamid.tmweb.ru/client/index.php";

let selectedDate;
let selectedMovie;


/*

// если расскомментировать - падает с ошибкой 


const chai = require('chai'); 
const expect = chai.expect;
const assert = chai.assert;
*/



process.env.DEFAULT_TIMEOUT_INTERVAL = 70000; // 70 секунд

Before(async function() {
  browser = await puppeteer.launch();
  page = await browser.newPage();
});


After(async () => {
  await browser.close(); // Закрываем браузер после завершения всех тестов
});



// Функция для настройки страницы
async function setupPage() {
    browser = await puppeteer.launch({ headless: false }); // Открываем браузер с видимым интерфейсом для отладки
    const newPage = await browser.newPage();
    await newPage.goto(pageStart);
    return newPage;
  }



Given('I am on the booking page', async () => {
    // Add logic to navigate to the booking page and set the 'page' object
    // Настройка объекта 'page', через puppeteer
    page = await setupPage(); // Настройка страницы
    await commands.checkSiteAvailability(page);
});

When('I choose a random date and return it', async () => {
    selectedDate = await commands.chooseRandomDate(page);
    console.log("Selected random date:", selectedDate);
    return selectedDate;
});

When('I choose a random movie based on the selected date and return it', async () => {
    selectedMovie = await commands.chooseRandomMovie(page, selectedDate);
    console.log("Selected random movie based on the date:", selectedMovie);
    return selectedMovie;
});

When('I select a random session for the chosen movie based on the selected date and movie and return it', async () => {
    const selectedTime = await commands.chooseRandomTimeForMovie(page, selectedMovie, selectedDate);
    console.log("Selected session for the chosen movie based on the date and movie:", selectedTime);
    return selectedTime;
});



When('I select seats 1, 2, 3, 4', async () => {

    await new Promise((resolve) => setTimeout(resolve, 6000)); // Добавьте ожидание, если необходимо

    const seats = [1, 2, 3, 4]; // Номера мест, которые нужно выбрать

    const seatSelectors = [
        'body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(1) > span:nth-child(1)',
        'body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(2) > span:nth-child(1)',
        'body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(3) > span:nth-child(1)',
        'body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(4) > span:nth-child(1)'
    ];
    
    for (let i = 0; i < seats.length; i++) {
        const currentSeat = seats[i]; 
        const selector = seatSelectors[i];

        console.log(`Selecting seat ${currentSeat} with selector ${selector}`);
        await commands.clickOnMultipleElements(page, selector);

        await new Promise((resolve) => setTimeout(resolve, 300)); 
    }
}, 65000);




When('I select a specific seat', async () => {

    await new Promise((resolve) => setTimeout(resolve, 10000)); // Добавьте ожидание, если необходимо


    const seatSelector = 'body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(4) > span:nth-child(1)';
    const seatElement = await page.$(seatSelector);
    if (seatElement) {
        await seatElement.click(); // Кликнуть на выбранное место
    } else {
        throw new Error(`Element with selector '${seatSelector}' not found.`);
    }

    await new Promise((resolve) => setTimeout(resolve, 10000)); // Добавьте ожидание, если необходимо
},10000);






Then('the booking button becomes clickable', async () => {
    await commands.checkButtonClickable(page);
});

When('I select a random past session', async () => {
    const { element } = await commands.chooseRandomPastSession(page);

    if (!element) {
        console.log("Failed to select a random element.");
    } else {
        await commands.checkElementClassBeforeAndAfterClick(element);

       
    }
});

Then('Я проверяю, что класс элемента не изменился после клика', async () => {
    const { element } = await commands.chooseRandomPastSession(page);

    if (!element) {
        console.log("Не удалось выбрать случайный элемент.");
    } else {
        const { classBeforeClick, classAfterClick } = await commands.checkElementClassBeforeAndAfterClick(element);

        expect(classBeforeClick).to.equal(classAfterClick);
        assert.strictEqual(classBeforeClick, classAfterClick, "Класс элемента изменился после клика.");
    }
/*
    // Проверяем, что класс элемента не изменился после клика
    if (classBeforeClick === classAfterClick) {
        console.log('Class of the element did not change after click!');
    } else {
        console.log('Class of the element changed after click.');
    }

    */
});


