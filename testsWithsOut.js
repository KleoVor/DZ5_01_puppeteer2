const puppeteer = require("puppeteer");

describe("Booking", () => {
  let browser;
  let page;

  beforeEach(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.goto("https://qamid.tmweb.ru/client/index.php");
    await checkSiteAvailability();
  }, 10000);

  afterEach(async () => {
    await browser.close();
  });

  const checkSiteAvailability = async () => {
    await page.waitForSelector("a");
    const aElements = await page.$$("a");

    if (!aElements.length) {
      console.log("❌ Элемент <a> не найден на странице.");
      return;
    }

    await page.setViewport({ width: 1920, height: 1080 });
  };

  const clickOnMultipleElements = async (elements, timeout = 2000) => {
    for (const elem of elements) {
      await elem.click();
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  };

  describe("successful booking", () => {
    test("Booking chairs 1/1, 2/1, 3/1, 4/1", async () => {
      // Находим все элементы 'a' в навигационной панели
      const dates = await page.$$("nav.page-nav a.page-nav__day");

      // Генерируем случайный индекс для выбора случайного элемента из найденных элементов
      const randomIndex = Math.floor(Math.random() * dates.length);
      const randomDateElement = dates[randomIndex];

      // Получаем текст выбранной случайной даты из элемента
      const dateText = await page.evaluate(
        (el) => el.textContent.trim(),
        randomDateElement,
      );
      console.log("Выбрана случайная дата:", dateText);

      // Кликаем на выбранный случайный элемент даты
      await randomDateElement.click();

      // Делаем паузу в 2 секунды
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Находим все элементы с классом 'movie'
      const movies = await page.$$(".movie");

      // Генерируем случайный индекс для выбора случайного фильма из найденных элементов
      const randomMovieIndex = Math.floor(Math.random() * movies.length);
      const randomMovie = movies[randomMovieIndex];

      // Получаем название выбранного случайного фильма
      const movieTitle = await randomMovie.$eval(
        "h2",
        (title) => title.textContent,
      );
      console.log("Selected movie:", movieTitle);

      // Найдем все доступные временные интервалы для фильма
      const availableTimes = await randomMovie.$$(
        ".movie-seances__time:not(.acceptin-button-disabled)",
      );
      const clickableTimes = availableTimes.filter(async (time) => {
        return await time.evaluate((el) => !el.disabled);
      });

      if (clickableTimes.length === 0) {
        console.log(
          "No clickable time intervals available for the selected movie.",
        );
      } else {
        const randomTime =
          clickableTimes[Math.floor(Math.random() * clickableTimes.length)];

        if (randomTime) {
          await randomTime.click();
          console.log(
            "Clicked on a random time for the selected movie:",
            await randomTime.evaluate((el) => el.textContent.trim()),
          );
        } else {
          console.log(
            "Unable to click on the random time for the selected movie.",
          );
        }
      }

      // Дождемся загрузки страницы
      await page.waitForNavigation({ timeout: 60000, waitUntil: "load" });

      // Проверим текущий URL страницы
      const currentURL = await page.url();
      if (currentURL === "https://qamid.tmweb.ru/client/hall.php") {
        console.log("Страница успешно открыта:", currentURL);
      } else {
        console.log(
          "Произошла ошибка при открытии страницы. Текущий URL:",
          currentURL,
        );
      }

      const seatElements = await page.$$(
        "body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(1) > span:nth-child(1), body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(2) > span:nth-child(1), body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(3) > span:nth-child(1), body > main > section > div.buying-scheme > div.buying-scheme__wrapper > div:nth-child(4) > span:nth-child(1)",
      );

      await clickOnMultipleElements(seatElements);

      // Проверка кликабельности кнопки
      const isButtonClickable = await page.evaluate(() => {
        const button = document.querySelector("body > main > section > button");
        if (button) {
          return (
            !button.disabled &&
            !button.hidden &&
            (button.offsetWidth ||
              button.offsetHeight ||
              button.getClientRects().length)
          );
        }
        return false;
      });

      console.log(
        isButtonClickable
          ? "Кнопка кликабельна."
          : "Кнопка не кликабельна или не найдена на странице.",
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }, 60000);
  });

  test("Selecting a random date, movie, and time, chair 1/1", async () => {
    const dates = await page.$$("nav.page-nav a.page-nav__day");
    const randomDateIndex = Math.floor(Math.random() * dates.length);
    const randomDateElement = dates[randomDateIndex];
    const dateText = await randomDateElement.evaluate((el) =>
      el.textContent.trim(),
    );
    console.log("Выбрана случайная дата:", dateText);
    await randomDateElement.click();

    const movies = await page.$$(".movie");
    const randomMovieIndex = Math.floor(Math.random() * movies.length);
    const randomMovie = movies[randomMovieIndex];
    const movieTitle = await randomMovie.$eval(
      "h2",
      (title) => title.textContent,
    );
    console.log("Selected movie:", movieTitle);

    const availableTimes = await randomMovie.$$(
      ".movie-seances__time:not(.acceptin-button-disabled)",
    );
    const clickableTimes = await Promise.all(
      availableTimes.map(
        async (time) => await time.evaluate((el) => !el.disabled),
      ),
    );

    const clickableTimeIndex = clickableTimes.findIndex((time) => time);
    if (clickableTimeIndex !== -1) {
      const randomTime = availableTimes[clickableTimeIndex];
      await randomTime.click();
      const selectedTimeText = await randomTime.evaluate((el) =>
        el.textContent.trim(),
      );
      console.log(
        "Clicked on a random time for the selected movie:",
        selectedTimeText,
      );
    } else {
      console.log("Unable to click on the random time for the selected movie.");
    }

    await page.waitForNavigation({ waitUntil: "load" });

    const currentURL = await page.url();
    if (currentURL === "https://qamid.tmweb.ru/client/hall.php") {
      console.log("Страница успешно открыта:", currentURL);
    } else {
      console.log(
        "Произошла ошибка при открытии страницы. Текущий URL:",
        currentURL,
      );
    }

    const seatElements = await page.$$(
      ".buying-scheme__wrapper span:nth-child(1)",
    );
    await Promise.all(
      seatElements.map(async (elem) => {
        await elem.click();
        console.log("Clicked on a seat element.");
      }),
    );

    const isButtonClickable = await page.evaluate(() => {
      const button = document.querySelector("body > main > section > button");
      return (
        button &&
        !button.disabled &&
        !button.hidden &&
        (button.offsetWidth ||
          button.offsetHeight ||
          button.getClientRects().length)
      );
    });

    if (isButtonClickable) {
      console.log("Кнопка кликабельна.");
    } else {
      console.log("Кнопка не кликабельна или не найдена на странице.");
    }
  }, 10000);

  describe("unsuccessful booking", () => {
    test("time has passed", async () => {
      // Находим все заблокированные временные интервалы
      const disabledTimes = await page.$$(
        ".movie-seances__time.acceptin-button-disabled",
      );

      // пробуем кликнуть по выбранному заблокированному времени
      for (const disabledTime of disabledTimes) {
        await disabledTime.click();
      }

      if (disabledTimes.length > 0) {
        // Генерируем случайный индекс для выбора случайного заблокированного времени
        const randomIndex = Math.floor(Math.random() * disabledTimes.length);
        const randomDisabledTime = disabledTimes[randomIndex];

        // Кликаем на выбранное случайное заблокированное время
        await randomDisabledTime.click();
        console.log("Clicked on a random disabled time");

        // Ожидаем навигации, но не переход на новую страницу
        const navigationPromise = page.waitForNavigation({
          timeout: 60000,
          waitUntil: "load",
        });
        await page.goBack();
        await navigationPromise;

        // Проверяем текущий URL страницы
        const currentURL = await page.url();
        if (currentURL === "https://qamid.tmweb.ru/client/index.php") {
          console.log("Successfully remained on the same page:", currentURL);
        } else {
          console.log(
            "Error navigating to the index page. Current URL:",
            currentURL,
          );
        }
      } else {
        console.log("No disabled time intervals found on the page.");
      }

      // Добавляем паузу перед завершением теста
      await new Promise((resolve) => setTimeout(resolve, 6000));
    }, 60000); // Установка таймаута теста в 60 секунд
  });
});
