*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}         http://127.0.0.1:8000
${BROWSER}     Chrome
${USERNAME}    standard_user
${PASSWORD}    secret_sauce

*** Keywords ***
Open Login Page
    Open Browser    ${URL}    ${BROWSER}
    Set Window Size    1280    900
    Page Should Contain    STSWENG Login Demo

Login With Valid Credentials
    Input Text       id:username    ${USERNAME}
    Input Password   id:password    ${PASSWORD}
    Click Button     id:login-button

Products Page Should Be Open
    Wait Until Page Contains Element    id:products-page
    Page Should Contain    Products

*** Comments ***
# These reusable keywords are built using SeleniumLibrary keywords.