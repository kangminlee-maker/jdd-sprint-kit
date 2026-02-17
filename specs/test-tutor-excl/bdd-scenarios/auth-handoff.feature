@p0 @brownfield
Feature: MyPage Authentication Handoff
  As a Student
  I want to navigate from MyPage to Tutor Management seamlessly
  So that I can manage my blocked tutors without re-authenticating

  @p0
  Scenario: Successful token handoff from MyPage
    Given Student is authenticated on MyPage (Vue.js 2)
    When Student clicks "Tutor Management" in the Class Settings menu
    Then MyPage should generate a one-time auth token
    And navigate to "/my/tutor-management?token=xxx"
    When React SPA receives the token
    Then it should exchange the token for an access token
    And the URL token should be invalidated
    And the management page should load successfully

  @p0
  Scenario: Expired token redirects to login
    Given Student has a token that was generated more than 5 minutes ago
    When React SPA attempts to exchange the expired token
    Then the exchange should fail
    And Student should be redirected to the login page

  @p0
  Scenario: Missing token redirects to login
    Given Student navigates directly to "/my/tutor-management" without a token
    Then Student should be redirected to the login page

  @p0
  Scenario: Token reuse attempt fails
    Given Student has successfully exchanged a token
    When the same token is used again
    Then the exchange should fail with "invalid token"
    And Student should be redirected to the login page
