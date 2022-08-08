let lastClick = 0;
let delay = 100;
let shipping_same_as_billing = true;
// Provinces and their taxes in % 
let provinces = {
    "AB": 5,
    "BC": 12,
    "MB": 12,
    "NB": 15,
    "NL": 15,
    "NT": 5,
    "NS": 15,
    "NU": 5,
    "ON": 13,
    "PE": 15,
    "QC": 14.975,
    "SK": 11,
    "YT": 5
};

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

function setSpecificErrorMessage(error, error_m) {
    // Shows a specific error message to the user
    for (let i = 0; i < $("[data-error]").length; i++) {
        if (($($("[data-error]")[i]).attr("data-error")) === error) {
            $($("[data-error]")[i]).html(error_m);
            $($("[data-error]")[i]).show();
        }
    }
}

function changeShipping() {
    // Toggle the visibility and data inside Shipping Tab
    $('#shipping-info').toggle();
    shipping_same_as_billing = !shipping_same_as_billing;
    if (shipping_same_as_billing) {
        $("#firstNameS").val($("#firstName").val());
        $("#lastNameS").val($("#lastName").val());
        $("#addressS").val($("#address").val());
        $("#address2S").val($("#address2").val());
        $("#countryS").val($("#country").val());
        $("#cityS").val($("#city").val());
        $("#stateS").val($("#state").val());
        $("#zipS").val($("#zip").val());
    } else {
        $("#firstNameS").val("");
        $("#lastNameS").val("");
        $("#addressS").val("");
        $("#address2S").val("");
        $("#countryS").val("");
        $("#cityS").val("");
        $("#stateS").val("");
        $("#zipS").val("");
    }
}

function submitOrder() {
    // Submits user order
    let submission_data = {
        card_number: $("#cc-number").val().replace(/\s+/g, ''),
        expiry_month: $("#cc-exp-month-div input").val().trim(),
        expiry_year: $("#cc-exp-year-div input").val().trim(),
        security_code: $("#cc-cvv").val().trim(),
        amount: cart.getPriceTotal().toFixed(2),
        taxes: (taxes / 100 * cart.getPriceTotal()).toFixed(2),
        shipping_amount: shipping,
        currency: previousSelect,
        items: cart.products,
        billing: {
            first_name: $("#firstName").val().trim(),
            last_name: $("#lastName").val().trim(),
            address_1: $("#address").val().trim(),
            address_2: $("#address2").val().trim(),
            city: $("#city").val().trim(),
            province: $("#state").val().trim(),
            country: $("#country").val().trim(),
            postal: $("#zip").val().trim(),
            phone: $("#phone-number").val().trim(),
            email: $("#email").val().trim()
        },
        shipping: {
            first_name: $("#firstNameS").val().trim(),
            last_name: $("#lastNameS").val().trim(),
            address_1: $("#addressS").val().trim(),
            address_2: $("#address2S").val().trim(),
            city: $("#cityS").val().trim(),
            province: $("#stateS").val().trim(),
            country: $("#countryS").val().trim(),
            postal: $("#zipS").val().trim()
        }
    };
    
    let form_data = new FormData();
    form_data.append('submission', JSON.stringify(submission_data));
    let errors_data;

    fetch('https://deepblue.camosun.bc.ca/~c0180354/ics128/final/', { 
        method: "POST",
        cache: 'no-cache',
        body: form_data
    }).then(response => response.json()).
    then((json) => {
        errors_data = json;
        $("#modal-confirmation").hide();
        if (errors_data.status === "NOT SUBMITTED") {
            for (let [error, error_m] of Object.entries(errors_data.error)) {
                // Show errors
                setSpecificErrorMessage(error, error_m);
            }
        } else {
            // If submission succeded
            $("#myModal").hide();
            $("#modal-success").fadeIn().delay(5000).fadeOut();
            // Clear cart
            cart.products = {};
            set_cookie("shopping_cart", cart.products);
            // Reload some fields
            cart.displayQuantityViewCart();
            cart.displayCart();

            // Reloads the page after 5 seconds
            setTimeout(function() {
                $("#myForm").submit();
            }, 5000);
        }
    });
}

function validateAll() {
    // Check if everything is ok
    changeShipping();
    changeShipping();
    let valid = true;
    
    valid = valid & verifyCreditCard("#cc-number-div");
    valid = valid & validateExpM("#cc-exp-month-div");
    valid = valid & validateExpY("#cc-exp-year-div");
    valid = valid & checkExp();
    valid = valid & validateCVV("#cc-cvv-div");
    valid = valid & validateTextField("#first-name-div", 2);
    valid = valid & validateTextField("#last-name-div", 2);
    valid = valid & validateTextField("#address-div", 5);
    valid = valid & validateTextField("#city-div", 3);
    valid = valid & validateEmail("#email-div");
    valid = valid & validatePhoneNumber("#phone-div");
    valid = valid & validatePC("#pc-div");
    valid = valid & validateTextField("#first-name-divS", 2);
    valid = valid & validateTextField("#last-name-divS", 2);
    valid = valid & validateTextField("#address-divS", 5);
    valid = valid & validateTextField("#city-divS", 3);
    valid = valid & validatePC("#pc-divS");

    if (valid) {
        // If it's valid
        try {
            // Try to change taxes to the appropriate province
            taxes = provinces[$("#stateS").val()];
        } catch (e) {
            // If get's an error, just set to 0 (US)
            taxes = 0;
        }
        $("#modal-confirmation").show();
        cart.displayCartConfirmation();
        $(".close").on("click", function() {
            $("#modal-confirmation").hide();
        });
    }
}

function checkExp() {
    let error_message = $("#cc-exp-month-div .invalid-feedback");
    let month = parseInt($("#cc-exp-month-div input").val().trim());
    let year  = parseInt($("#cc-exp-year-div input").val().trim());
    if (year === new Date().getFullYear() && month > new Date().getMonth()) {
        error_message.hide();
        return true;
    }
    error_message.show();
    return false;
}

function verifyCreditCard(div) {
    // Validate credit card number
    let error_message = $(div + " .invalid-feedback");
    let cc_number = $(div + " #cc-number").val();
    if (typeof cc_number !== "string") { return false; }
    cc_number = cc_number.replace(/\s+/g, '');
    let amex_regex = /^3[47][0-9]{13}$/;
    let visa_mastercard_regex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$/;
    if (amex_regex.test(cc_number) || visa_mastercard_regex.test(cc_number)) {
        error_message.hide();
        return true;
    }
    error_message.show();
    return false;

}

function validateExpM(div) {
    // Validates month
    let error_message = $(div + " .invalid-feedback");
    let month = $(div + " input").val().trim();
    let month_regex = /^(0?[1-9]|1[012])$/;
    if (month_regex.test(month)) {
        expiry_month = month;
        error_message.hide();
        return true;
    }
    error_message.show();
    return false;

}

function validateExpY(div) {
    // Validates year 
    let error_message = $(div + " .invalid-feedback");
    let yearToday = new Date().getFullYear();
    let year = $(div + " input").val().trim();
    let year_regex = /^20\d{2}$/;
    if (year_regex.test(year) && parseInt(year) > yearToday - 1) {
        expiry_year = year;
        error_message.hide();
        return true;
    }
    error_message.show();
    return false;

}

function validateCVV(div) {
    // Validates CVV
    let error_message = $(div + " .invalid-feedback");
    let cvv = $(div + " #cc-cvv").val().trim();
    let cvv_regex = /^[0-9]{3,4}$/;
    if (cvv_regex.test(cvv)) {
        security_code = cvv;
        error_message.hide();
        return true;
    }
    error_message.show();
    return false;

}

function validateTextField(div, number) {
    // Looks for a mininum length in an input
    let error_message = $(div + " .invalid-feedback");
    let myString = $(div + " input").val().trim();
    let mininum_len_regex = new RegExp(".{" + number + ",}");
    if (mininum_len_regex.test(myString)) {
        error_message.hide();
        return true;
    }
    error_message.show();
    return false;
}

function validateEmail(div) {
    // Validates Email
    let error_message = $(div + " .invalid-feedback");
    let email = $(div + " input").val().trim();
    let email_regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (email_regex.test(email)) {
        error_message.hide();
        return true;
    }
    error_message.show();
    return false;
}

function validatePhoneNumber(div) {
    // Validates Phone num
    let error_message = $(div + " .invalid-feedback");
    let phone_num = $(div + " input").val().trim();
    let phone_regex = /^[0-9]{3}[ -]?[0-9]{3}[ -]?[0-9]{4}$/;
    if (phone_num[1] == phone_num[2] || !(phone_num[0] != 0 && phone_num[0] != 1)) {
        error_message.show();
        return false;
    }

    if (phone_regex.test(phone_num)) {
        error_message.hide();
        return true;
    }
    error_message.show();
    return false;
}

function validatePC(div) {
    // Validates Postal Code
    let error_message = $(div + " .invalid-feedback-alt");
    let pc = $(div + " input").val().trim();
    let pc_regex_ca = /[ABCEGHJKLMNPRSTVXY][0-9][ABCEGHJKLMNPRSTVWXYZ][- ]?[0-9][ABCEGHJKLMNPRSTVWXYZ][0-9]/;
    let pc_regex_us = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    if (pc_regex_ca.test(pc) || pc_regex_us.test(pc)) {
        error_message.hide();
        return true;
    }
    error_message.show();
    return false;
}

function validateProvince() {
    // Validates Province (only shipping)
    let error_message = $("#stateS-div .invalid-feedback");
    let province = $("#stateS-div input").val().trim();
    if (province.length !== 2) {
        error_message.show();
        return false;
    }
    error_message.hide();
    return true;
    
}

function geocoder(s = "") {
    // Autocomplete for address 1 field
    if (lastClick >= (Date.now() - delay)) {
        return;
    }
    lastClick = Date.now();
    let userInput = $("#address" + s).val().split(" ");

    try {
        fetch("https://geocoder.ca/?autocomplete=1&geoit=xml&auth=test&json=1&locate=" + userInput).
            then(response => response.json()).
            then((json) => {
                
                if (!(typeof json === "undefined" || typeof json['streets'] === "undefined" || typeof json['streets']['street'] === "undefined")) {
                    let streets = json['streets']['street'];
                    $("#datalist-address" + s).empty();
                    for (let i = 0; i < 5; i++) {
                        $("#datalist-address" + s).append(`
                            <option value="${streets[i]}"></option>
                        `);
                    }

                    userInput = $("#address" + s).val().split(", ");
                    if (userInput.length === 4) {
                        $("#address" + s).val(userInput[0]);
                        $("#city" + s).val(userInput[1]);
                        $("#state" + s).val(userInput[2]);
                        $("#zip" + s).val(userInput[3]);
                        $("#country" + s).val("CA");
                    }
                }
            });
    } catch (e) {
        return;
    }
}