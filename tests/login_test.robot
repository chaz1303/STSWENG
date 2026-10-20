*** Settings ***
Documentation     Smoke test for the successful login flow.
Resource          resource.robot
Suite Teardown    Close All Browsers

*** Test Cases ***
Successful Login
    [Documentation]    A valid user should reach the Products page.
    Open Login Page
    Login With Valid Credentials
    Products Page Should Be Open

*** Comments ***
# This is a positive smoke test for the login feature.