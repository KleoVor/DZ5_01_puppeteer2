const puppeteer = require("puppeteer");
const {
  checkSiteAvailability,
  clickOnMultipleElements,
  chooseRandomDate,
  chooseRandomMovie,
  chooseRandomTimeForMovie,
  clickElement,
  checkPageURL,
  checkButtonClickable,
  chooseRandomPastSession,
} = require("./lib/commands.js");

const pageStart = "https://qamid.tmweb.ru/client/index.php";
const pageBooking = "https://qamid.tmweb.ru/client/hall.php";

describe("Booking", () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.goto(pageStart);
    await checkSiteAvailability(page);
  }, 30000);

  afterAll(async () => {
    await browser.close();
  });

  describe("successful booking", () => {
    test("Booking chairs 1/1, 2/1, 3/1, 4/1", async () => {
      const seatSelectors = [
        "body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(1) > span:nth-child(1)",
        "body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(2) > span:nth-child(1)",
        "body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(3) > span:nth-child(1)",
        "body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(4) > span:nth-child(1)",
      ];

      const selectedDate = await chooseRandomDate(page);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("выбрана случайная дата:", selectedDate);

      const selectedMovie = await chooseRandomMovie(page);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("выбран случайный фильм:", selectedMovie);

      const selectedTime = await chooseRandomTimeForMovie(page, selectedMovie);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("выбран сеанс в выбранном фильме:", selectedTime);

      await checkSiteAvailability(pageBooking);

      await clickOnMultipleElements(page, seatSelectors);

      await checkButtonClickable(page);

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }, 160000);
  });

  test("Selecting a random date, movie, and time, chair 1/1", async () => {
    const seatSelectors = [
      "body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(1) > span:nth-child(1)",
    ];

    const selectedDate = await chooseRandomDate(page);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("выбрана случайная дата:", selectedDate);

    const selectedMovie = await chooseRandomMovie(page);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("выбран случайный фильм:", selectedMovie);

    const selectedTime = await chooseRandomTimeForMovie(page, selectedMovie);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("выбран сеанс в выбранном фильме:", selectedTime);

    await checkSiteAvailability(pageBooking);

    await clickOnMultipleElements(page, seatSelectors);

    await checkButtonClickable(page);

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, 160000);

  describe("unsuccessful booking", () => {
    test("booking for the last time", async () => {
      const { element: randomElement, index: randomIndex } =
        await chooseRandomPastSession(page);

      if (!randomElement) {
        console.log("Не удалось выбрать случайный элемент.");
      } else {
        // Получаем класс элемента до клика
        const classBeforeClick = await randomElement.evaluate(
          (el) => el.className,
        );

        // Совершаем клик на кнопку
        await randomElement.click();

        // Получаем класс элемента после клика
        const classAfterClick = await randomElement.evaluate(
          (el) => el.className,
        );

        // Проверяем, что класс элемента остался без изменений
        expect(classBeforeClick).toBe(classAfterClick);

        console.log("Класс элемента до клика:");
        console.log(classBeforeClick);
        console.log("Класс элемента после клика:");
        console.log(classAfterClick);
      }
    });
  });
});
