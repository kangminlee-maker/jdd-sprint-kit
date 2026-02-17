@p0 @new
Feature: Post-Lesson Rating
  As a Student
  I want to rate my lessons after completion
  So that I can provide feedback on tutor quality

  Background:
    Given Student is authenticated
    And Student has a completed lesson with status "FINISH"

  @p0
  Scenario: Rating popup appears on Reservation tab entry
    Given Student has an unrated FINISH lesson
    And Student has not seen the rating popup today
    When Student enters the Reservation tab
    Then the rating popup should appear
    And the popup should display the tutor name and lesson date

  @p0
  Scenario: Rating popup shows once per day only
    Given Student has already seen the rating popup today
    And Student has an unrated FINISH lesson
    When Student enters the Reservation tab
    Then the rating popup should not appear

  @p0
  Scenario: Student submits 1-star rating with negative reasons
    Given the rating popup is displayed
    When Student selects 1 star
    And Student selects negative reasons "ONE_SIDED_TALK" and "NO_CORRECTION"
    And Student clicks "Submit"
    Then the rating should be saved with star_rating 1
    And the negative reasons should be saved
    And the popup should close

  @p0
  Scenario: Student submits 4-star rating with positive reasons
    Given the rating popup is displayed
    When Student selects 4 stars
    And Student clicks "Next"
    And Student selects positive reasons "CLEAR_EXPLANATION" and "FRIENDLY_ATMOSPHERE"
    And Student clicks "Submit"
    Then the rating should be saved with star_rating 4
    And the positive reasons should be saved

  @p0
  Scenario: Student saves star only then skips reasons
    Given the rating popup is displayed
    When Student selects 4 stars
    And Student clicks "Next"
    Then the star rating 4 should be saved
    When Student clicks "Skip"
    Then the popup should close
    And only the star rating should be saved without reasons

  @p0
  Scenario: Student skips the entire rating
    Given the rating popup is displayed
    When Student clicks the "Skip" text link
    Then no rating data should be saved
    And the popup should close

  @p0
  Scenario: Student closes popup with X button
    Given the rating popup is displayed
    When Student clicks the X close button
    Then no rating data should be saved
    And the popup should close

  @p1
  Scenario: Rating popup only shows for FINISH status lessons
    Given Student has a lesson with status "CANCELLED"
    And Student has no FINISH lessons pending rating
    When Student enters the Reservation tab
    Then the rating popup should not appear

  @p0
  Scenario: Duplicate rating attempt returns error
    Given Student has already rated lesson 12345
    When Student attempts to rate lesson 12345 again
    Then the system should return error "ALREADY_RATED"

  @p0
  Scenario: Only most recent unrated lesson triggers popup
    Given Student has 3 unrated FINISH lessons
    When Student enters the Reservation tab
    Then the popup should show only the most recent unrated lesson
