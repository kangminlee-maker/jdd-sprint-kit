@p0 @new
Feature: Block Limit Management
  As a Student
  I want to understand block limits per language
  So that I can manage my tutor blocks within the allowed quota

  Background:
    Given Student is authenticated

  @p0
  Scenario: Block limit enforced at 5 per language
    Given Student has 5 EN tutors blocked
    When Student attempts to block another EN tutor
    Then the system should return error "BLOCK_LIMIT_EXCEEDED"
    And the error should include current count 5 and max 5
    And the error should include management_url "/my/tutor-management"

  @p0
  Scenario: EN and JP block limits are independent
    Given Student has 5 EN tutors blocked
    And Student has 0 JP tutors blocked
    When Student attempts to block a JP tutor
    Then the block should be created successfully
    And EN block count should remain 5
    And JP block count should be 1

  @p0
  Scenario: Limit exceeded shows guidance message
    Given Student has 5 EN tutors blocked
    When Student tries to block another EN tutor from rating popup
    Then the rating should be saved (star + reasons)
    But the block should not be created
    And a guidance message should appear with management page link

  @p0
  Scenario: Inactive tutors count toward block limit
    Given Student has 4 EN tutors blocked
    And 1 of the blocked tutors is inactive
    When Student counts EN blocks
    Then the count should be 4 (including inactive tutor)
    And Student can block 1 more EN tutor

  @p0
  Scenario: Double-pack student has independent limits
    Given Student subscribes to both EN and JP (double-pack)
    When Student blocks 5 EN tutors and 5 JP tutors
    Then total blocks should be 10
    And EN count should show 5/5
    And JP count should show 5/5

  @p1
  Scenario: Concurrent block requests near limit
    Given Student has 4 EN tutors blocked
    When two block requests for different EN tutors arrive simultaneously
    Then exactly one block should succeed
    And the other should receive "BLOCK_LIMIT_EXCEEDED" error
