const puppeteer = require("puppeteer");
const { Before, After, Given, When, Then } = require("@cucumber/cucumber");
const commands = require("../../lib/commands");

let browser;
let page;
const pageStart = "https://qamid.tmweb.ru/client/index.php";

let selectedDate;
let selectedMovie;

// Использую динамический импорт для модуля chai
let chai;
let expect;
let assert;

// Динамический импорт для загрузки chai и разрешения ошибки ERR_REQUIRE_ESM
import("chai")
  .then((chaiModule) => {
    chai = chaiModule.default || chaiModule;
    expect = chai.expect;
    assert = chai.assert;
  })
  .catch((error) => {
    console.error('Ошибка загрузки модуля "chai" динамически:', error);
  });

var { setDefaultTimeout } = require("@cucumber/cucumber");

setDefaultTimeout(60 * 1000);

Before(async function () {
  browser = await puppeteer.launch();
  page = await browser.newPage();
});

After(async () => {
  await browser.close();
});

// Функция для настройки страницы
async function setupPage() {
  browser = await puppeteer.launch({ headless: false }); // Открываем браузер с видимым интерфейсом для отладки
  const newPage = await browser.newPage();
  await newPage.goto(pageStart);
  return newPage;
}

Given("I am on the booking page", async () => {
  page = await setupPage(); // Настройка страницы
  await commands.checkSiteAvailability(page);
});

When("I choose a random date and return it", async () => {
  selectedDate = await commands.chooseRandomDate(page);
  console.log("Selected random date:", selectedDate);
  return selectedDate;
});

When(
  "I choose a random movie based on the selected date and return it",
  async () => {
    selectedMovie = await commands.chooseRandomMovie(page, selectedDate);
    console.log("Selected random movie based on the date:", selectedMovie);
    return selectedMovie;
  },
);

When(
  "I select a random session for the chosen movie based on the selected date and movie and return it",
  async () => {
    const selectedTime = await commands.chooseRandomTimeForMovie(
      page,
      selectedMovie,
      selectedDate,
    );
    console.log(
      "Selected session for the chosen movie based on the date and movie:",
      selectedTime,
    );
    return selectedTime;
  },
);

When(
  "I select seats 1, 2, 3, 4",
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const seats = [1, 2, 3, 4]; // Номера мест, которые нужно выбрать

    await commands.clickOnMultipleElements(
      page,
      seats.map((seat) => {
        return `.buying-scheme__wrapper > div:nth-child(${seat}) > span:nth-child(1)`;
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 300));
  },
  5000,
);

When(
  "I select a specific seat",
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const seatSelector =
      "body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(4) > span:nth-child(1)";
    const seatElement = await page.$(seatSelector);
    if (seatElement) {
      await seatElement.click(); // Кликнуть на выбранное место
    } else {
      throw new Error(`Element with selector '${seatSelector}' not found.`);
    }

    await new Promise((resolve) => setTimeout(resolve, 10000));
  },
  10000,
);

Then("the booking button becomes clickable", async () => {
  await commands.checkButtonClickable(page);
});

When("I select a random past session", async () => {
  const { element } = await commands.chooseRandomPastSession(page);

  if (!element) {
    console.log("Failed to select a random element.");
  } else {
    await commands.checkElementClassBeforeAndAfterClick(element);
  }
});

Then("Я проверяю, что класс элемента не изменился после клика", async () => {
  const { element } = await commands.chooseRandomPastSession(page);

  if (!element) {
    console.log("Не удалось выбрать случайный элемент.");
  } else {
    const { classBeforeClick, classAfterClick } =
      await commands.checkElementClassBeforeAndAfterClick(element);

    expect(classBeforeClick).to.equal(classAfterClick);
    assert.strictEqual(
      classBeforeClick,
      classAfterClick,
      "Класс элемента изменился после клика.",
    );
  }
});
