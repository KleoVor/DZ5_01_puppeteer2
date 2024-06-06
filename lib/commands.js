module.exports = {
  clickElement: async function (page, selector, selectedValue) {
    const elements = await page.$$(selector);

    if (elements.length === 0) {
      throw new Error(`Element not found: ${selector}`);
    }

    let elementClicked = false;

    for (const element of elements) {
      const elementText = await element.evaluate((el) => el.textContent.trim());

      if (elementText === selectedValue) {
        await element.click();
        console.log(`Clicked on element with text: ${elementText}`);
        elementClicked = true;
        break;
      }
    }

    if (!elementClicked) {
      throw new Error(`No clickable element found with text: ${selectedValue}`);
    }
  },

  checkSiteAvailability: async function (page) {
    try {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Подождать 2000 миллисекунд (2 секунды)
        const aElements = await page.$$("a");

        if (!aElements.length) {
            console.log("Элемент <a> не найден на странице.");
            return;
        }

        await page.setViewport({ width: 1920, height: 1080 });
    } catch (error) {
        console.error("Произошла ошибка при ожидании элемента <a>:", error);
    }

  },

  checkPageURL: async function (page, expectedURL) {
    // Ожидаем перехода на новую страницу с таймаутом 60 секунд и полным загрузкой страницы
    await page.waitForNavigation({ timeout: 60000, waitUntil: "load" });

    // Получаем текущий URL страницы
    const currentURL = await page.url();

    // Проверяем, соответствует ли текущий URL ожидаемому URL
    if (currentURL === expectedURL) {
      // Выводим сообщение об успешном открытии страницы
      console.log(`Страница успешно открыта: ${currentURL}`);
    } else {
      // Выбрасываем ошибку в случае несоответствия URL
      throw new Error(
        `Произошла ошибка при открытии страницы. Текущий URL: ${currentURL}`,
      );
    }
  },

  clickOnMultipleElements: async function (page, selectors, timeout = 2000) {
    for (const selector of selectors) {
      const element = await page.$(selector);
      if (element) {
        await element.click();
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        console.error(`Element with selector "${selector}" not found.`);
      }
    }
  },

  chooseRandomDate: async function (page) {
    const chosenDates = await page.$$(
      "nav.page-nav a.page-nav__day.page-nav__day_chosen",
    );
    const allDates = await page.$$("nav.page-nav a.page-nav__day");

    const todayDate = await page.$(
      "nav.page-nav a.page-nav__day.page-nav__day_today",
    );

    const dates = allDates.filter((date) => date !== todayDate);

    const randomIndex = Math.floor(Math.random() * dates.length);
    const randomDateElement = dates[randomIndex];

    const dateText = await page.evaluate(
      (el) => el.textContent.trim(),
      randomDateElement,
    );

    // Клик по выбранной случайной дате
    await randomDateElement.click();

    return dateText;
  },

  chooseRandomMovie: async function (page) {
    const movies = await page.$$(".movie");
    const randomMovieIndex = Math.floor(Math.random() * movies.length);
    const randomMovie = movies[randomMovieIndex];
    const movieTitle = await randomMovie.$eval(
      "h2",
      (title) => title.textContent,
    );

    return movieTitle;
  },

  chooseRandomTimeForMovie: async function (page, selectedMovie) {
    const movies = await page.$$(".movie");
    let movieElement;

    for (const movie of movies) {
      const movieTitle = await movie.$eval("h2", (el) => el.innerText);

      if (movieTitle === selectedMovie) {
        movieElement = movie;
        break;
      }
    }

    if (!movieElement) {
      console.log(`Фильм "${selectedMovie}" не найден.`);
      return null;
    }

    const availableTimes = await movieElement.$$eval(
      ".movie-seances__time",
      (elements) => elements.map((element) => element.innerText),
    );

    if (!availableTimes || availableTimes.length === 0) {
      console.log(
        `Нет доступных времен для просмотра фильма "${selectedMovie}".`,
      );
      return null;
    }

    const randomTimeIndex = Math.floor(Math.random() * availableTimes.length);
    const randomTime = await movieElement.$$(".movie-seances__time");

    if (randomTime[randomTimeIndex]) {
      await randomTime[randomTimeIndex].click();
      console.log(
        `Выбрано время для фильма "${selectedMovie}": ${availableTimes[randomTimeIndex]}`,
      );
      return availableTimes[randomTimeIndex];
    } else {
      console.log(
        `Ошибка: Не удалось выбрать случайное время для фильма "${selectedMovie}".`,
      );
      return null;
    }
  },

  checkButtonClickable: async function (page) {
    const button = await page.evaluate(() => {
      const button = document.querySelector("body > main > section > button");
      return (
        button &&
        !button.disabled &&
        !button.hidden &&
        button.offsetWidth &&
        button.offsetHeight &&
        button.getClientRects() &&
        button.getClientRects().length
      );
    });

    if (button) {
      console.log("Кнопка ЗАБРОНИРОВАТЬ кликабельна на странице.");
    } else {
      throw new Error("Кнопка не кликабельна на странице.");
    }
  },

  chooseRandomPastSession: async function (page) {
    const movieSeances = await page.$$(
      ".movie-seances__time.acceptin-button-disabled",
    );
    const randomIndex = Math.floor(Math.random() * movieSeances.length);
    const randomElement = movieSeances[randomIndex];

    // Получаем текстовое содержимое выбранного элемента
    const selectedTime = await page.evaluate(
      (el) => el.innerText,
      randomElement,
    );

    console.log("Выбранное случайное время:");
    console.log(selectedTime);

    return {
      element: randomElement,
      index: randomIndex,
      time: selectedTime,
    };
  },
};
