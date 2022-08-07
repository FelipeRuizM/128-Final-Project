let card_number;
let expiry_month;
let expiry_year;
let security_code;
let lastClick = 0;
let delay = 100;

function setErrorMessage() {
    // Set all error messages for every input field using the info in this link 
    // https://deepblue.camosun.bc.ca/~c0180354/ics128/final/
    let error_messages = Object.values(error_message['error']);
    error_messages.splice(0, 2);
    error_messages.splice(error_messages.length - 2, 2);
    Object.values(error_message['error']['billing']).forEach(element => error_messages.push(element));
    Object.values(error_message['error']['shipping']).forEach(element => error_messages.push(element));
    let error_ps = $(".invalid-feedback");
    for (let i = 0; i < error_ps.length; i++) {
        error_ps[i].innerHTML = error_messages[i];
    }
}

function changeShipping() {
    // Toggle the visibility of Shipping Tab
    $('#shipping-info').toggle();
}

function submitOrder() {
    let submission_data = { 
        card_number: card_number,
        expiry_month: expiry_month,
        expiry_year: expiry_year,
        security_code: security_code,
        amount: cart.getPriceTotal().toFixed(2),
        taxes: 'amount of taxes -- example: 12.34',
        shipping_amount: shipping,
        currency: previousSelect,
        items: cart.products,
        billing: {
            first_name: 'John',
            last_name: 'Doe',
            address_1: '123 Some St',
            address_2: 'Second Street Info [Optional] ',
            city: 'Some City',
            province: 'Two Character Province or State Code',
            country: 'Two Character Country Code',
            postal: 'Valid Postal or ZIP Code',
            phone: 'Valid International or North American Phone Number',
            email: 'Valid Email Address'
        },
        shipping: {
            first_name: 'John',
            last_name: 'Doe',
            address_1: '123 Some St',
            address_2: 'Second Street Info [Optional] ',
            city: 'Some City',
            province: 'Two Character Province or State Code',
            country: 'Two Character Country Code',
            postal: 'Valid Postal or ZIP Code'  
        }
    };
    let form_data = new FormData();
    form_data.append('submission', JSON.stringify(submission_data));
}

function validateAll() {
    
}

function verifyCreditCard(div) {
    /* Dummy Card numbers:
     MasterCard 5555 5555 5555 4444
     Visa       4012 8888 8888 1881
     Amex       3759 870000 00088
    */
    let error_message = $(div + " .invalid-feedback");
    let cc_number = $(div + " #cc-number").val().replace(/\s+/g, '');
    let amex_regex = /^3[47][0-9]{13}$/;
    let visa_mastercard_regex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$/;
    if (amex_regex.test(cc_number) || visa_mastercard_regex.test(cc_number)) {
        card_number = cc_number;
        error_message.hide();
    } else {
        error_message.show();
    }
}

function validateExpM(div) {
    let error_message = $(div + " .invalid-feedback");
    let month = $(div + " input").val().trim();
    let month_regex = /^(0?[1-9]|1[012])$/;
    if (month_regex.test(month)) {
        expiry_month = month;
        error_message.hide();
    } else {
        error_message.show();
    }
}

function validateExpY(div) {
    let error_message = $(div + " .invalid-feedback");
    let yearToday  = new Date().getFullYear();
    let year = $(div + " input").val().trim();
    let year_regex = /^20\d{2}$/;
    if (year_regex.test(year) && parseInt(year) > yearToday - 1) {
        expiry_year = year;
        error_message.hide();
    } else {
        error_message.show();
    }
}

function validateCVV(div) {
    let error_message = $(div + " .invalid-feedback");
    let cvv = $(div + " #cc-cvv").val().trim();
    let cvv_regex = /^[0-9]{3,4}$/;
    if (cvv_regex.test(cvv)) {
        security_code = cvv;
        error_message.hide();
    } else {
        error_message.show();
    }
}

function validateTextField(div, number) {
    // Looks for a mininum length in an input
    let error_message = $(div + " .invalid-feedback");
    let myString = $(div + " input").val().trim();
    let mininum_len_regex = new RegExp(".{" + number + ",}");
    if (mininum_len_regex.test(myString)) {
        error_message.hide();
    } else {
        error_message.show();
    }
}

function validateEmail(div) {
    let error_message = $(div + " .invalid-feedback");
    let email = $(div + " input").val().trim();
    let email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (email_regex.test(email)) {
        error_message.hide();
    } else {
        error_message.show();
    }
}

function validatePC(div) {
    let error_message = $(div + " .invalid-feedback-alt");
    let pc = $(div + " input").val().trim();
    let pc_regex_ca = /[ABCEGHJKLMNPRSTVXY][0-9][ABCEGHJKLMNPRSTVWXYZ][- ]?[0-9][ABCEGHJKLMNPRSTVWXYZ][0-9]/;
    let pc_regex_us = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    if (pc_regex_ca.test(pc) || pc_regex_us.test(pc)) {
        error_message.hide();
    } else {
        error_message.show();
    }
}

function geocoder(s="") {
    if (lastClick >= (Date.now() - delay)) {
        return;
    }
    lastClick = Date.now();
    let userInput = $("#address"+s).val().split(" ");

    try {
        fetch("https://geocoder.ca/?autocomplete=1&geoit=xml&auth=test&json=1&locate=" + userInput).
            then(response => response.json()).
            then((json) => {
                let streets = json['streets']['street'];
                $("#datalist-address"+s).empty();
                for (let i = 0; i < 5; i++) {
                    $("#datalist-address"+s).append(`
                        <option value="${streets[i]}"></option>
                    `);
                }

                userInput = $("#address"+s).val().split(", ");
                if (userInput.length === 4) {
                    $("#address"+s).val(userInput[0]);
                    $("#city"   +s).val(userInput[1]);
                    $("#state"  +s).val(userInput[2]);
                    $("#zip"    +s).val(userInput[3]);
                    $("#country"+s).val("Canada");
                }
            });
    } catch (e) {
        return;
    }
}