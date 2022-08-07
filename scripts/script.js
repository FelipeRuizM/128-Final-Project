let priceSign = "CA$"; // Global Price Sign
let cart = new Cart(get_cookie("shopping_cart")); // Cart Object
let allProducts; // All Products json object
let price_API;   // Currencies json object
let previousSelect = "cad"; // Previous/Current currency
let shipping = 10; // Shipping price (in cad)
let error_message; // Error messages json object

$(document).ready(function () {
    cart.displayQuantityViewCart();
    load_data_with_fetch();
    $('#myModal').modal('show');
    setAll();
});

function load_data_with_fetch() {
    // Fetch Fake Store API
    fetch("https://fakestoreapi.com/products").
        then(response => response.json()).
        then((json) => {
            allProducts = json;
            for (let product of allProducts) {
                createCard(product);
            }
            let catalog_container = document.getElementById("catalog");
            $(catalog_container).imagesLoaded(function () {
                // This initializes the masonry container AFTER the product images are loaded
                var msnry = new Masonry(catalog_container);
            });
            // This has to be here because fetch is assync
            $(".card-button").click(function () {
                let id = this.id.replace("-add-to-cart-button", "");
                cart.add(id);
            });
            cart.displayCartCheckout();
        }).catch(error => {
            // If something happens with the first API, fetch Backup Fake Store API
            fetch("https://deepblue.camosun.bc.ca/~c0180354/ics128/final/fakestoreapi.json").
                then(response => response.json()).
                then((json) => {
                    allProducts = json;
                    for (let product of allProducts) {
                        createCard(product);
                    }
                    let catalog_container = document.getElementById("catalog");
                    $(catalog_container).imagesLoaded(function () {
                        // This initializes the masonry container AFTER the product images are loaded
                        var msnry = new Masonry(catalog_container);
                    });
                    // This has to be here because fetch is assync
                    $(".card-button").click(function () {
                        let id = this.id.replace("-add-to-cart-button", "");
                        cart.add(id);
                    });
                    cart.displayCartCheckout();
                });
        });

    // Fetch Currency API
    fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cad.json").
        then(response => response.json()).
        then((json) => {
            price_API = json;
        }).catch(error => {
            // If something happens with the first API, fetch Currency API
            fetch("https://deepblue.camosun.bc.ca/~c0180354/ics128/final/currencies-cad.json").
                then(response => response.json()).
                then((json) => {
                    price_API = json;
                });
        });

    // Fetch Error Messages API
    fetch('https://deepblue.camosun.bc.ca/~c0180354/ics128/final/').
        then(response => response.json()).
        then((json) => {
            error_message = json;
            setErrorMessage();
        });
}

function createCard(p) {
    // Create a card for every product (p)
    $("#catalog").html($("#catalog").html() + `
        <div class="col-sm-6 col-lg-4 mb-4">
            <div class="card">
                <img class="product-image" src="${p.image}">
                <div class="card-body">
                    <h5 class="product-title">${p.title}</h5>
                    <p class="product-description">${p.description}</p>
                    <p class="product-price" data-id="${p.id}">${priceSign}${p.price.toFixed(2)}</p>
                    <button class="card-button nice-button" id="${p.id}-add-to-cart-button">Add to cart</button>
                </div>
            </div>
        </div>
    `);
}

function displayHamburger() {
    // Display Your Cart tab
    cart.displayCart();
}

function changeCurrency(select) {
    // Changes the currency of the site
    let myValue = select.options[select.selectedIndex].value;
    if (myValue === "cad") {
        priceSign = "CA$";
    }
    else if (myValue === "usd") {
        priceSign = "$";
    }
    else if (myValue === "brl") {
        priceSign = "R$";
    }
    let exchange = price_API.cad[myValue];
    let previousExchange = price_API.cad[previousSelect];
    for (let id in allProducts) {
        let p = allProducts[id];
        p.price = p.price / previousExchange;
        p.price = p.price * exchange;
        $(".product-price")[id].innerHTML = priceSign + p.price.toFixed(2);
    }

    shipping = shipping / previousExchange;
    shipping = shipping * exchange;
    previousSelect = myValue;
}