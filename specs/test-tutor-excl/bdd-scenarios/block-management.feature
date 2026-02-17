@p0 @new
Feature: Block Management Page
  As a Student
  I want to view and manage my blocked tutors
  So that I can unblock tutors and free up block slots

  Background:
    Given Student is authenticated
    And Student navigates to the block management page

  @p0
  Scenario: View blocked tutor list
    Given Student has 3 EN tutors blocked
    When the management page loads
    Then 3 blocked tutor cards should be displayed
    And each card should show tutor name, profile photo, block date, and last lesson date
    And the counter should show "3/5"

  @p0
  Scenario: Inactive tutor shows label
    Given Student has blocked tutor "Emily Davis" who has since resigned
    When the management page loads
    Then the card for "Emily Davis" should display an "Inactive" label

  @p0
  Scenario: Unblock a tutor
    Given Student has 3 EN tutors blocked
    And Student clicks "Unblock" on tutor "James Miller"
    Then an unblock confirmation dialog should appear
    When Student confirms the unblock
    Then the block should be soft-deleted (is_active=false, released_at set)
    And "James Miller" card should be removed from the list
    And the counter should update to "2/5"
    And an "Unblocked" toast should appear

  @p0
  Scenario: Unblocked tutor returns to matching pool
    Given Student unblocks tutor "James Miller"
    When Student requests a new lesson match for "EN"
    Then "James Miller" should be eligible in the matching pool

  @p0
  Scenario: Block history preserved after unblock
    Given Student unblocks tutor "James Miller"
    When admin queries block history for Student
    Then the original block record should exist with is_active=false and released_at set

  @p0
  Scenario: Empty state when no blocks
    Given Student has no blocked tutors
    When the management page loads
    Then an empty state message should be displayed
    And the counter should show "0/5"

  @p0
  Scenario: Language tab filter
    Given Student has 3 EN tutors and 1 JP tutor blocked
    When Student selects the "EN" tab
    Then only EN blocked tutors should be displayed
    When Student selects the "JP" tab
    Then only JP blocked tutors should be displayed

  @p1
  Scenario: Unblock then re-block same tutor
    Given Student unblocks tutor "James Miller"
    When Student blocks "James Miller" again
    Then a new block record should be created
    And the previous block history should be preserved
