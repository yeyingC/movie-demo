var token;
var products = [];
var productsModel = {};
var cartModel = {};

// helper for get cookie from browser
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

// helper to delete cookie in browser
function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// helper to get products from server
function getProducts() {
    // no need to ask server for products if user is not logged in
    if (!token) {
        return;
    }

    $.ajax({
        url: "http://open-commerce.herokuapp.com/api/products",
        type: "GET",
        data: {
            'token': token
        },
        success: function(res) {
            products = res;
            // update all models after getting the latest products
            updateProductsModel();
            updateCartModelFromCookie();
            console.log(res);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

// helper to read cart from cookie, update cart based on latest products.
function updateCartModelFromCookie() {
    if (getCookie('cartModel')) {
        var persistedCart = JSON.parse(getCookie('cartModel'));
        // delete products that are no longer in the productsModel
        for (var key in persistedCart) {
            if (!(key in productsModel)) {
                delete persistedCart.key;
            }
        }
        cartModel = persistedCart;
        document.cookie = 'cartModel=' + JSON.stringify(cartModel);
    } else {
        cartModel = {};
    }

    // update cart and navigation view after updating cart model
    updateCartView();
    updateNavigationView();
}

// helper to update the product map based on latest products
function updateProductsModel() {
    products.forEach(function(product) {
        productsModel[product._id] = product;
    });

    // update productview after updating product model
    updateProductsView();
}

// helper to update navigation bar
function updateNavigationView() {
    if (token) {
        $('#loginNav').hide();
        $("#logoutNav").show();
    } else {
        $("#loginNav").show();
        $("#logoutNav").hide();
    }

    if (Object.keys(cartModel).length === 0) {
        $("#cartNav").hide();
    } else {
        $("#cartNav").show();
    }
}

// helper to update product view based on latest products
function updateProductsView() {
    for (var i = 0; i < products.length; i++) {
        var nameTd = '<td>' + products[i].name + '</td>';
        var priceTd = '<td>' + products[i].price + '</td>';
        var stockTd = '<td>' + products[i].stock + '</td>';

        if (products[i].stock > 0) {
            var purchaseTd = '<td><button class="btn btn-primary btn-purchase" id="' + products[i]._id + '">Purchase</button></td>';
        } else {
            var purchaseTd = '<td><button class="btn" disabled="true">Not Available</button></td>';
        }

        $('<tr>').html(nameTd + priceTd + stockTd + purchaseTd).appendTo("#product-table");
    }

    $(".btn-purchase").click(function(event) {
        alert("Product added to shopping cart");
        var productId = $(event.target).attr('id');
        cartModel[productId] = 1;
        document.cookie = "cartModel=" + JSON.stringify(cartModel);
        updateNavigationView();
    });

}

// helper to update cart view based on latest cart model
function updateCartView() {
    // do not update cart view if cart is empty, or if there is no product, or if it's not on shopping cart page
    if (Object.keys(cartModel).length === 0 || products.length === 0 || $('.shopping-cart').length === 0) {
        return;
    }

    for (var key in cartModel) {
        var button =  '<div class="buttons"><span class="delete-btn"></span></div>';
        var image = '<div><img class="product-image" src="' + productsModel[key].imageUrl + '" alt="" /></div>';
        var description = '<div class="description"><span>Common Projects</span><span>Bball High</span><span>White</span></div>';
        var quantity = '<div class="quantity"><button class="plus-btn" type="button" name="button"><img src="plus.svg" alt="" /></button><input type="text" name="name" value="1"><button class="minus-btn" type="button" name="button"><img src="minus.svg" alt="" /></button></div>';
        var price = '<div class="total-price">$549</div>'
        var item = '<div class="item">' + button + image + description + quantity + price + '</div>';
        $('.shopping-cart').append(item);
    }

}

$(document).ready(function() {

    token = getCookie('x-access-token');
    // get the latest products from server everytime user loads the page
    getProducts();
    // update navigation page based on token
    updateNavigationView();

    $("#logoutNav").click(function(event) {
        event.preventDefault();
        deleteCookie('x-access-token');
        deleteCookie('cartModel');
        token = null;
        window.location.href = "/movie/index.html";
    });

    $("#loginBtn").click(function(event){
        event.preventDefault();
        var username = $("#username").val();
        var password = $("#password").val();
        if (username && password) {
            $.post("http://open-commerce.herokuapp.com/api/login",
                {
                    username: username,
                    password: password
                },
                function(res) {
                    if (res.success) {
                        var cookie = 'x-access-token=' + res.token;
                        document.cookie = cookie;
                        window.location.href = "/movie/index.html";
                    } else {
                        alert(res.message);
                    }
                });
        } else {
            alert("please provide a username and password for login");
        }
    });

    $("#signupBtn").click(function(event) {
        event.preventDefault();
        var username = $("#username").val();
        var password = $("#password").val();
        if (username && password) {
            $.post("http://open-commerce.herokuapp.com/api/signup",
                 {
                    username: username,
                    password: password
                 },
                 function(res) {
                    if (res.success) {
                        alert("signup success!");
                    } else {
                        alert(res.message);
                    }
                 });
        } else {
            alert("please provide a username and password for signup");
        }
    });

});