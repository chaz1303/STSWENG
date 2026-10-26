*** Settings ***
Documentation     Smoke test: the built PWA loads and shows the happy path.
...               Run with `npm run test:e2e` (builds first). Needs Python + requirements.txt and Chrome.
Library           SeleniumLibrary
Library           Process
Suite Setup       Start Preview Server
Suite Teardown    Run Keywords    Close All Browsers    AND    Terminate All Processes

*** Variables ***
${URL}            http://localhost:4173
${BROWSER}        headlesschrome

*** Test Cases ***
App Loads
    Open Browser    ${URL}    ${BROWSER}
    Set Window Size    390    844
    Wait Until Keyword Succeeds    10x    1s    Reload And Expect Title
    Page Should Contain    Register

*** Keywords ***
Start Preview Server
    Start Process    npx vite preview --port 4173 --strictPort    shell=True

Reload And Expect Title
    Reload Page
    Page Should Contain    Mang Juan
