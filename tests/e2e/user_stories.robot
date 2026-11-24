*** Settings ***
Documentation     Happy-path user stories written before the screens exist: every test
...               fails while src/client/App.jsx still renders "Placeholder for ...".
...
...               Runs against tests/e2e/server.js: dist/ plus the real API on the in-memory store and
...               the mock aide API, so offers, charges and status changes come from the server, not stubs.
...
...               Locator contract the screens must follow (accessible names, not CSS classes):
...               - a field is found by its <label> text or aria-label;
...               - buttons, links, chips, cards and tabs are found by their visible text;
...               - a selected chip, card or tab says so with aria-pressed, aria-checked or aria-selected="true";
...               - each step's inputs sit in one <form>, so Submit Form sends it.
Library           SeleniumLibrary
Library           Process
Library           DateTime
Suite Setup       Start App
Suite Teardown    Run Keywords    Close All Browsers    AND    Terminate All Processes
Test Setup        Fresh Page

*** Variables ***
${PORT}               4174
${URL}                http://localhost:${PORT}
${BROWSER}            headlesschrome
${MOCK_AIDE_KEY}      e2e-mock-aide-key
${PASSWORD}           Secret#123
${CONDO}              Avida Towers Prime Taft
${UNIT_NUMBER}        12B
# Base prices from the seed (db/schema.sql, tests/helpers/memoryStore.js). The backlog says Quick
# Checkup is ₱200; the seed says ₱250, and the screen must show what the API returns.
${CHECKUP_PRICE}      ₱250
${STANDARD_PRICE}     ₱450
${MAJOR_PRICE}        ₱800
${CHARGE_LABEL}       Replacement Pipe Elbow
${CHARGE_AMOUNT}      ${150}
${FIFTY_CHARS}        Water drips under the kitchen sink every few secs.

*** Test Cases ***
TC-FE-01 Register Opens The OTP Sheet With A 120 Second Countdown
    [Tags]    U01
    Go To Step    register
    ${mobile}    ${email}=    New Identity
    Fill Field    Mobile number    ${mobile}
    Fill Field    Full name    Maria Clara
    Fill Field    Email    ${email}
    Fill Field    Password    ${PASSWORD}
    Submit Form
    Wait Until Page Contains Element    xpath://input[@autocomplete='one-time-code' or contains(@aria-label,'code')]    10s
    ${first}=    Countdown Seconds
    Should Be True    115 <= ${first} <= 120    Countdown should start at 2:00, got ${first}s
    Sleep    2s
    ${later}=    Countdown Seconds
    Should Be True    ${later} < ${first}    Countdown did not move: ${first}s then ${later}s

TC-FE-01 Register Rejects A Mobile Number Not Starting With 9
    [Tags]    U01
    Go To Step    register
    ${mobile}    ${email}=    New Identity
    Fill Field    Mobile number    08123456789
    Fill Field    Full name    Juan Dela Cruz
    Fill Field    Email    ${email}
    Fill Field    Password    ${PASSWORD}
    Submit Form
    Wait Until Page Contains    Enter a Philippine mobile number    5s

TC-FE-01 Log In From The Register Page Stores The Token
    [Tags]    U01
    ${mobile}=    Seed Resident Without Unit
    Go To Step    register
    Click Named    Log in
    Fill Field    Mobile number    ${mobile}
    Fill Field    Password    ${PASSWORD}
    Submit Form
    Wait Until Keyword Succeeds    10x    500ms    Token Should Be Stored
    ${location}=    Get Location
    Should Not Contain    ${location}    register

TC-FE-02 Plumbing Tiers Show Contract Durations And Base Prices
    [Tags]    U03    U05    U06
    Go To Step    service
    Click Named    Plumbing
    Tier Should Show    Checkup / Quick Repair    ${CHECKUP_PRICE}    15\\s*min
    Tier Should Show    Standard Service    ${STANDARD_PRICE}    30\\s*[-–]\\s*60\\s*min
    Tier Should Show    Major Repair    ${MAJOR_PRICE}    (1\\+\\s*h|60\\+\\s*min)
    Click Named    Standard Service
    Should Be Selected    Standard Service
    Should Not Be Selected    Checkup / Quick Repair

TC-FE-03 Symptom Chips Toggle And The Notes Counter Stops At 300
    [Tags]    U04
    Go To Step    describe
    Click Named    Pipe Leak
    Click Named    Low Pressure
    Should Be Selected    Pipe Leak
    Should Be Selected    Low Pressure
    Click Named    Pipe Leak
    Should Not Be Selected    Pipe Leak
    Input Text    xpath://textarea    ${FIFTY_CHARS}
    Wait Until Page Contains    50 / 300    2s
    Input Text    xpath://textarea    ${{ 'x' * 301 }}
    ${length}=    Execute Javascript    return document.querySelector('textarea').value.length
    IF    ${length} > 300
        ${next}=    Named    Next
        Element Should Be Disabled    ${next}
    ELSE
        Should Be Equal As Integers    ${length}    300
    END

TC-FE-04 Now Is The Default And Schedule Opens A Date And Time Picker
    [Tags]    U07    U08
    Go To Step    when
    Should Be Selected    Now
    Element Should Not Be Visible    css:input[type=date]
    Click Named    Schedule
    Should Be Selected    Schedule
    Wait Until Element Is Visible    css:input[type=date]    2s
    ${tomorrow}=    Get Current Date    increment=1 day    result_format=%Y-%m-%d
    Set Date Input    ${tomorrow}
    Textfield Value Should Be    css:input[type=date]    ${tomorrow}
    ${slot}=    Execute Javascript
    ...    const s = [...document.querySelectorAll('button,[role=radio]')].find((b) => /\\d{1,2}:\\d{2}/.test(b.textContent) && !b.disabled);
    ...    if (s) s.click(); return s ? s.textContent.trim() : null;
    Should Not Be Equal    ${slot}    ${None}    No time slot to pick
    Should Be Selected    ${slot}
    Click Named    Now
    Element Should Not Be Visible    css:input[type=date]

TC-FE-06 Review Applies MANONG50 And Books The Unit With GCash
    [Tags]    U11
    ${token}=    Log In Seeded Resident
    Go To Step    service
    Click Named    Plumbing
    Click Named    Standard Service
    Go To Step    describe
    Click Named    Pipe Leak
    Go To Step    when
    Click Named    Now
    Go To Step    review
    Click Named    ${CONDO}
    Fill Field    Voucher    MANONG50
    Click Named    Apply
    Wait Until Page Contains    ₱400    5s    # ₱450 Standard Service minus the ₱50 voucher
    Click Named    GCash
    Should Be Selected    GCash
    Click Named    Confirm
    ${bookings}=    Wait Until Keyword Succeeds    10x    500ms    Latest Booking    ${token}
    Should Be Equal    ${bookings}[payment_method]    gcash
    Should Be Equal    ${bookings}[booking_type]    on-demand
    Should Be Equal    ${bookings}[category]    plumbing

TC-FE-07 Status Follows The Booking From Requested To In Progress
    [Tags]    U12    U13
    ${token}=    Log In Seeded Resident
    ${booking}=    Seed Booking    ${token}
    Go To Step    status
    Wait Until Page Contains    Requested    10s
    Element Should Be Enabled    xpath:(//*[self::button or self::a or @role='button'][contains(normalize-space(.),'Cancel')])[1]
    ${aide}=    Aide Takes The Job    ${token}    ${booking}
    Wait Until Page Contains    Accepted    10s
    Wait Until Page Contains    ${aide}[full_name]    10s
    Page Should Contain Element    xpath://img[contains(@alt,'${aide}[first_name]')]
    Page Should Contain Element    xpath://*[self::a or self::button][contains(.,'Message') or contains(.,'Call') or contains(.,'Chat')]
    Element Should Be Enabled    xpath:(//*[self::button or self::a or @role='button'][contains(normalize-space(.),'Cancel')])[1]
    Aide API    PATCH    /api/mock-aide/bookings/${booking}/progress
    ...    ${{ {'aide_id': $aide['id'], 'aide_status': 'on_the_way', 'eta_minutes': 12} }}
    Wait Until Page Contains    On the way    10s
    Wait Until Page Contains    12 min    10s
    Aide API    PATCH    /api/mock-aide/bookings/${booking}/status    ${{ {'aide_id': $aide['id'], 'status': 'In Progress'} }}
    Wait Until Page Contains    In Progress    10s
    Cancel Should Be Unavailable

TC-FE-09 Summary Itemizes The Bill And Adds The ₱50 Tip
    [Tags]    U15
    ${token}=    Log In Seeded Resident
    ${booking}=    Seed Booking    ${token}
    ${aide}=    Aide Takes The Job    ${token}    ${booking}
    Aide API    PATCH    /api/mock-aide/bookings/${booking}/status    ${{ {'aide_id': $aide['id'], 'status': 'In Progress'} }}
    ${charge}=    Aide API    POST    /api/mock-aide/bookings/${booking}/charges
    ...    ${{ {'aide_id': $aide['id'], 'label': $CHARGE_LABEL, 'amount': $CHARGE_AMOUNT} }}
    Resident API    PATCH    /api/bookings/${booking}/charges/${charge}[charge][id]    ${token}    ${{ {'approved': True} }}
    Go To Step    summary
    Wait Until Page Contains    ${CHARGE_LABEL}    10s
    Page Should Contain    Standard Service
    Page Should Contain    ${STANDARD_PRICE}
    Page Should Contain    ₱150
    Page Should Contain    GCash
    Click Element    xpath://*[self::button or @role='radio' or @role='button'][normalize-space(.)='₱50']
    Wait Until Page Contains    ₱650    5s    # ₱450 + ₱150 approved charge + ₱50 tip (no voucher: see FE-06)

TC-FE-10 Complete Saves A 5 Star Review With Punctual And Goes Home
    [Tags]    U16
    ${token}=    Log In Seeded Resident
    ${booking}=    Seed Booking    ${token}
    ${aide}=    Aide Takes The Job    ${token}    ${booking}
    Aide API    PATCH    /api/mock-aide/bookings/${booking}/status    ${{ {'aide_id': $aide['id'], 'status': 'In Progress'} }}
    Aide API    PATCH    /api/mock-aide/bookings/${booking}/status    ${{ {'aide_id': $aide['id'], 'status': 'Completed'} }}
    Go To Step    complete
    Wait Until Page Contains Element    xpath://*[contains(@aria-label,'5 star')]    10s
    Element Should Be Enabled    xpath:(//*[self::button or self::a or @role='button'][contains(normalize-space(.),'Download Receipt')])[1]
    Click Element    xpath://*[contains(@aria-label,'5 star')]
    Click Named    Punctual
    Should Be Selected    Punctual
    Click Named    Submit
    Wait Until Keyword Succeeds    10x    500ms    Location Should Be    ${URL}/#/
    ${detail}=    Resident API    GET    /api/bookings/${booking}    ${token}
    Should Be Equal As Integers    ${detail}[booking][rating]    5
    Should Contain    ${detail}[booking][praise]    Punctual

*** Keywords ***
Start App
    Start Process    node    tests/e2e/server.js    cwd=${CURDIR}/../..    env:E2E_PORT=${PORT}
    Open Browser    ${URL}    ${BROWSER}
    Set Window Size    390    844
    Wait Until Keyword Succeeds    20x    500ms    Reload And Expect App

Reload And Expect App
    Go To    ${URL}/
    Page Should Contain    Mang Juan

Fresh Page
    Go To    ${URL}/
    Execute Javascript    localStorage.clear(); sessionStorage.clear();

Go To Step
    [Arguments]    ${step}
    Go To    ${URL}/#/${step}
    Wait Until Page Contains    Mang Juan    5s
    Page Should Not Contain    Placeholder for

# Locator for the first clickable thing whose visible text contains ${text}.
Named
    [Arguments]    ${text}
    RETURN    xpath:(//*[self::button or self::a or @role='button' or @role='radio' or @role='checkbox' or @role='tab' or @role='option'][contains(normalize-space(.),'${text}')])[1]

Click Named
    [Arguments]    ${text}
    ${loc}=    Named    ${text}
    Wait Until Element Is Visible    ${loc}    5s
    Click Element    ${loc}

Fill Field
    [Arguments]    ${label}    ${value}
    ${loc}=    Set Variable
    ...    xpath:(//*[self::input or self::textarea][@aria-label='${label}' or @id=//label[contains(normalize-space(.),'${label}')]/@for or ancestor::label[contains(normalize-space(.),'${label}')]])[1]
    Wait Until Element Is Visible    ${loc}    5s
    Input Text    ${loc}    ${value}

Should Be Selected
    [Arguments]    ${text}
    Wait Until Page Contains Element
    ...    xpath://*[contains(normalize-space(.),'${text}')][@aria-pressed='true' or @aria-checked='true' or @aria-selected='true']    2s
    ...    error=${text} is not marked selected (aria-pressed/checked/selected)

Should Not Be Selected
    [Arguments]    ${text}
    Page Should Not Contain Element
    ...    xpath://*[contains(normalize-space(.),'${text}')][@aria-pressed='true' or @aria-checked='true' or @aria-selected='true']

Tier Should Show
    [Arguments]    ${label}    ${price}    ${duration_pattern}
    ${loc}=    Named    ${label}
    Wait Until Element Is Visible    ${loc}    10s
    ${text}=    Get Text    ${loc}
    Should Contain    ${text}    ${price}
    Should Match Regexp    ${text}    ${duration_pattern}

# Seconds left on the first m:ss on screen.
Countdown Seconds
    ${s}=    Execute Javascript
    ...    const m = document.body.innerText.match(/\\b([0-2]):([0-5]\\d)\\b/);
    ...    return m ? Number(m[1]) * 60 + Number(m[2]) : -1;
    RETURN    ${s}

Set Date Input
    [Arguments]    ${date}
    # React ignores a plain .value write, so go through the native setter and fire input/change.
    Execute Javascript
    ...    const i = document.querySelector('input[type=date]');
    ...    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, arguments[0]);
    ...    i.dispatchEvent(new Event('input', { bubbles: true }));
    ...    i.dispatchEvent(new Event('change', { bubbles: true }));
    ...    ARGUMENTS    ${date}

Token Should Be Stored
    ${found}=    Execute Javascript
    ...    return Object.values(localStorage).some((v) => /^[\\w-]+\\.[\\w-]+\\.[\\w-]+$/.test(v));
    Should Be True    ${found}    No access token in localStorage

Cancel Should Be Unavailable
    ${loc}=    Named    Cancel
    ${count}=    Get Element Count    ${loc}
    IF    ${count} > 0    Element Should Be Disabled    ${loc}

# ---------- Fixtures: data goes in through the real API ----------
Call API
    [Arguments]    ${method}    ${path}    ${body}=${None}    ${token}=${EMPTY}
    ${res}=    Execute Async Javascript    ${CURDIR}${/}api.js
    ...    ARGUMENTS    ${method}    ${path}    ${body}    ${token}    ${MOCK_AIDE_KEY}
    Should Be True    0 < ${res}[status] < 300    ${method} ${path} -> ${res}
    RETURN    ${res}[body]

Resident API
    [Arguments]    ${method}    ${path}    ${token}    ${body}=${None}
    ${body}=    Call API    ${method}    ${path}    ${body}    ${token}
    RETURN    ${body}

Aide API
    [Arguments]    ${method}    ${path}    ${body}=${None}
    ${body}=    Call API    ${method}    ${path}    ${body}
    RETURN    ${body}

New Identity
    ${n}=    Evaluate    random.randint(1000000, 9999999)    modules=random
    RETURN    917${n}    e2e${n}@example.com

Seed Resident Without Unit
    ${mobile}    ${email}=    New Identity
    Call API    POST    /api/auth/register
    ...    ${{ {'full_name': 'Maria Clara', 'email': $email, 'mobile_number': $mobile, 'password': $PASSWORD} }}
    RETURN    ${mobile}

# Registers a resident with one saved unit, logs in through the UI, and returns the API token.
Log In Seeded Resident
    ${mobile}    ${email}=    New Identity
    ${reg}=    Call API    POST    /api/auth/register
    ...    ${{ {'full_name': 'Maria Clara', 'email': $email, 'mobile_number': $mobile, 'password': $PASSWORD} }}
    Resident API    POST    /api/me/units    ${reg}[token]    ${{ {'building': $CONDO, 'unit_number': $UNIT_NUMBER} }}
    Go To Step    register
    Click Named    Log in
    Fill Field    Mobile number    ${mobile}
    Fill Field    Password    ${PASSWORD}
    Submit Form
    Wait Until Keyword Succeeds    10x    500ms    Token Should Be Stored
    RETURN    ${reg}[token]

# On-demand Standard plumbing at the resident's unit, paid by GCash. Returns the booking id.
Seed Booking
    [Arguments]    ${token}
    ${units}=    Resident API    GET    /api/me/units    ${token}
    ${res}=    Resident API    POST    /api/bookings    ${token}
    ...    ${{ {'category': 'plumbing', 'service_type': 'STANDARD', 'booking_type': 'on-demand', 'unit_id': $units['units'][0]['id'], 'problem': 'Leaking sink', 'symptoms': ['Pipe Leak'], 'payment_method': 'gcash'} }}
    RETURN    ${res}[booking][id]

# The first mock Manong takes the resident's price and the resident accepts. Returns the Manong.
Aide Takes The Job
    [Arguments]    ${token}    ${booking}
    ${aides}=    Aide API    GET    /api/mock-aide/aides
    ${aide}=    Set Variable    ${aides}[aides][0]
    ${offer}=    Aide API    POST    /api/mock-aide/bookings/${booking}/offers    ${{ {'aide_id': $aide['id']} }}
    Resident API    POST    /api/bookings/${booking}/offers/${offer}[offer][id]/accept    ${token}
    RETURN    ${aide}

Latest Booking
    [Arguments]    ${token}
    ${res}=    Resident API    GET    /api/bookings    ${token}
    Should Not Be Empty    ${res}[bookings]
    RETURN    ${res}[bookings][0]
