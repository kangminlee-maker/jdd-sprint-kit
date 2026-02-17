@p0 @new
Feature: Tutor Block
  As a Student
  I want to block tutors I don't want to be matched with
  So that I can avoid unwanted tutor assignments

  Background:
    Given Student is authenticated
    And Student has fewer than 5 EN tutors blocked

  # Entry Point 1: Rating popup
  @p0
  Scenario: Block suggestion checkbox appears for 1-2 star ratings
    Given the rating popup is displayed
    When Student selects 1 star
    Then the "Don't match me with this tutor again" checkbox should appear

  @p0
  Scenario: Block suggestion checkbox does not appear for 3-5 star ratings
    Given the rating popup is displayed
    When Student selects 4 stars
    Then the block suggestion checkbox should not appear

  @p0
  Scenario: Student blocks tutor from rating popup
    Given the rating popup is displayed
    And Student selects 2 stars
    And Student selects negative reasons "UNCOMFORTABLE"
    And Student checks the "Don't match me again" checkbox
    When Student clicks "Submit"
    Then a block confirmation popup should appear
    When Student confirms the block
    Then the rating should be saved with star_rating 2
    And the tutor should be blocked with source "RATING_POPUP"
    And a success toast "Block complete!" should appear

  @p0
  Scenario: Student submits negative rating without blocking
    Given the rating popup is displayed
    And Student selects 1 star
    And Student does not check the block checkbox
    When Student clicks "Submit"
    Then the rating should be saved
    And no tutor block should be created

  # Entry Point 2: Lesson detail page
  @p0
  Scenario: Block button shown on lesson detail page
    Given Student navigates to lesson detail page for lesson 12345
    And the tutor for lesson 12345 is not blocked
    Then the "Block this tutor" button should be visible

  @p0
  Scenario: Block button shows "Blocked" when tutor already blocked
    Given Student navigates to lesson detail page for lesson 12345
    And the tutor for lesson 12345 is already blocked
    Then the button should show "Blocked" in disabled state

  @p0
  Scenario: Student blocks tutor from lesson detail
    Given Student is on lesson detail page for lesson 12345
    When Student clicks "Block this tutor"
    Then a confirmation dialog should appear
    When Student confirms
    Then the tutor should be blocked with source "LESSON_DETAIL"
    And the button should change to "Blocked" state
    And a success toast should appear

  # Entry Point 3: Management page
  @p1 @new
  Scenario: Student blocks tutor from management page
    Given Student is on the block management page
    When Student initiates a block from the management page
    Then the tutor should be blocked with source "MANAGEMENT_PAGE"

  # Matching exclusion
  @p0 @brownfield
  Scenario: Blocked tutor excluded from matching results
    Given Student has blocked tutor 201 for language "EN"
    When Student requests a new lesson match for language "EN"
    Then tutor 201 should not appear in the matching results

  @p0
  Scenario: Block applies only to new reservations
    Given Student has a scheduled lesson with tutor 201
    When Student blocks tutor 201
    Then the existing scheduled lesson should not be affected
    And tutor 201 should be excluded from future matching only

  @p0
  Scenario: Confirmation popup appears before blocking
    Given Student attempts to block a tutor from any entry point
    Then a confirmation popup should appear with message about future matching exclusion
    And Student must confirm before the block is created
