class Cart {
    constructor(products) {
        this.products = products;
    }

    add(id) {
        // Add products to the cart
        if (typeof this.products === "undefined" || this.products === null) {
            this.products = {};
        }
        if (this.products[id] == null) {
            this.products[id] = 1;
        } else {
            this.products[id]++;
        }
        set_cookie("shopping_cart", this.products);
        this.displayQuantityViewCart();
    }

    delete(id) {
        // Delete products from the cart
        delete this.products[id];
        set_cookie("shopping_cart", this.products);
        this.displayCart();
        this.displayQuantityViewCart();
    }

    checkout() {
        // Initialize the checkout tab

        // Adding checkout button to Cart tab
        $("#cart-table").after('<button type="button" id="checkout-button" class="nice-button" data-toggle="modal" data-target="#exampleModalCenter" onclick="cart.displayCartCheckout()">Checkout</button>');

        // Listener to checkout cart tab button
        $("#checkout-button").click(function () {
            $('#myModal').modal('show');
        });
    }

    getPriceTotal() {
        // Gets the total price of the cart
        let total = 0;
        for (let id in this.products) {
            total += allProducts[id - 1].price * this.products[id];
        }
        return total;
    }

    getProductTotal() {
        // Gets the total quantity of products in the cart
        let total = 0;
        for (let id in this.products) {
            total += this.products[id];
        }
        return total;
    }

    displayCart() {
        // Display Cart in Your Cart tab

        let $this = this;
        // Reset table
        $("#myPanel").html(`
            <table class="table table-hover" id="cart-table">
                <thead id="cart-head">
                </thead>
                <tbody id="cart-body">
                </tbody>
            </table>
            <p id="empty-cart-p" class="text-center"></p>
        `);

        // Set table
        if (Object.entries(this.products).length !== 0) {
            // Set table head
            $("#cart-head").html(`
                <tr>
                    <th class="text-left">&nbsp;</th>
                    <th class="text-left">Title</th>
                    <th class="text-center">Qty</th>
                    <th class="text-center">Price</th>
                    <th class="text-center">Item Total</th>
                </tr>
            `);

            // Set table body with products
            for (let id in this.products) {
                let p = allProducts[id - 1];
                $("#cart-body").html($("#cart-body").html() + `
                    <tr>
                        <td>
                            <button class="delete-product" id="${id}-delete-button">
                                <i class="material-symbols-rounded trash-bin">delete</i>
                            </button>
                        </td>
                        <td>${p.title}</td>
                        <td>${this.products[id]}</td>
                        <td>${priceSign}${p.price.toFixed(2)}</td>
                        <td>${priceSign}${(p.price * this.products[id]).toFixed(2)}</td>
                    </tr>
                `);
            }

            // Show total after showing products
            $("#cart-body").html($("#cart-body").html() + `
                <tr>
                    <td><b>Subtotal:</b></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>${priceSign}${this.getPriceTotal().toFixed(2)}</td>
                </tr>
            `);

            // Checkout
            this.checkout();

            // Adding empty cart button after the table 
            $("#cart-table").after('<button class="nice-button" id="empty-cart-button">Empty Cart</button>');

            // Removing empty cart message
            $("#empty-cart-p").html("");

            // Listeners
            $(".delete-product").click(function () {
                $this.delete(this.id.replace("-delete-button", ""));
            });

            $("#empty-cart-button").click(function () {
                $this.products = {};
                set_cookie("shopping_cart", $this.products);
                $this.displayCart();
                $this.displayQuantityViewCart();
            });

        } else {
            $("#empty-cart-p").html("Your cart is empty :(");
        }
    }

    displayQuantityViewCart() {
        // Shows how many products are in the cart beside "View Cart" button
        let $this = this;
        let total = this.getProductTotal();
        if (total > 0) {
            $("#cart-button").html(`
                <i class="material-symbols-outlined" id="shopping-cart-icon">
                    shopping_cart
                </i>View Cart (${$this.getProductTotal()})
            `);
        } else {
            $("#cart-button").html(`
                <i class="material-symbols-outlined" id="shopping-cart-icon">
                    shopping_cart
                </i>View Cart
            `);
        }
    }

    displayCartCheckout() {
        // Displays the cart in the checkout tab
        $("#cart-tab-checkout").html("");

        for (let id in this.products) {
            let p = allProducts[id - 1];
            $("#cart-tab-checkout").html($("#cart-tab-checkout").html() +
                `<li class="list-group-item d-flex justify-content-between lh-condensed">
                <div>
                    <h6 class="my-0">${p.title}</h6>
                    <small class="text-muted">x${this.products[id]}</small>
                </div>
                <span class="text-muted">${priceSign}${(p.price * this.products[id]).toFixed(2)}</span>
            </li>`);
        }

        $("#cart-tab-checkout").html($("#cart-tab-checkout").html() +
            `<li class="list-group-item d-flex justify-content-between bg-light">
            <div>
                <h6 class="my-0">Shipping</h6>
            </div>
            <span class="text-muted">${priceSign}${shipping.toFixed(2)}</span>
        </li>
        <li class="list-group-item d-flex justify-content-between">
            <span>Total (${previousSelect.toUpperCase()})</span>
            <strong>${priceSign}${(this.getPriceTotal() + shipping).toFixed(2)}</strong>
        </li>`);
    }

    displayCartConfirmation() {
        $("#order-confirmation-body").html(`
            <table class="table table-hover" id="cart-table-confirmation">
                <thead id="cart-head-confirmation">
                </thead>
                <tbody id="cart-body-confirmation">
                </tbody>
            </table>
        `);

        $("#cart-head-confirmation").html(`
            <tr>
                <th class="text-center">Title</th>
                <th class="text-center">Qty</th>
                <th class="text-center">Price</th>
                <th class="text-center">Item Total</th>
            </tr>
        `);
        for (let id in this.products) {
            let p = allProducts[id - 1];
            $("#cart-body-confirmation").html($("#cart-body-confirmation").html() + `
                <tr>
                    <td class="text-center">${p.title}</td>
                    <td class="text-center">${this.products[id]}</td>
                    <td class="text-center">${priceSign}${p.price.toFixed(2)}</td>
                    <td class="text-center">${priceSign}${(p.price * this.products[id]).toFixed(2)}</td>
                </tr>
            `);
        }
        $("#cart-body-confirmation").html($("#cart-body-confirmation").html() + `
            <tr>
                <td class="text-left">Shipping</td>
                <td class="text-center">&nbsp;</td>
                <td class="text-center">&nbsp;</td>
                <td class="text-center">${priceSign}${shipping.toFixed(2)}</td>
            <tr>
            <tr>
                <td class="text-left">Taxes</td>
                <td class="text-center">&nbsp;</td>
                <td class="text-center">&nbsp;</td>
                <td class="text-center">${priceSign}${(taxes / 100 * this.getPriceTotal()).toFixed(2)}</td>
            <tr>
            <tr>
                <td class="text-left">Total</td>
                <td class="text-center">&nbsp;</td>
                <td class="text-center">&nbsp;</td>
                <td class="text-center">${priceSign}${(this.getPriceTotal() + (taxes / 100 * this.getPriceTotal()) + shipping).toFixed(2)}</td>
            <tr>
        `);
    }
}
