Feature: Booking tickets for a movie



  Scenario: Successful booking process
    Given I am on the booking page
    When I choose a random date and return it
    And I choose a random movie based on the selected date and return it
    And I select a random session for the chosen movie based on the selected date and movie and return it
    And I select seats 1, 2, 3, 4
    Then the booking button becomes clickable




Scenario: Successful booking process 1
    Given I am on the booking page
    When I choose a random date and return it
    And I choose a random movie based on the selected date and return it
    And I select a random session for the chosen movie based on the selected date and movie and return it
    And I select a specific seat
    Then the booking button becomes clickable



  Scenario: Unsuccessful booking attempt
    Given I am on the booking page
    When I select a random past session
    Then Я проверяю, что класс элемента не изменился после клика