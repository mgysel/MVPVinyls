from flask import Flask, request, redirect, url_for, make_response, jsonify
from json import dumps
from werkzeug.security import generate_password_hash, check_password_hash
# imports for PyJWT authentication
import jwt

from bson.objectid import ObjectId

from objects.userObject import User
from objects.productObject import Product


def get_user_profile(objectId):
    '''
    Returns user from the database
    '''
    user = User.find_user_by_attribute("_id", objectId)

    if user:
        return make_response(
            dumps(
                {
                    "message": "success",
                    "data": {
                        "user": user.to_json()
                    }
                }
            ), 
            201
        ) 

    return make_response(
        dumps(
            {
                "message": "User does not exist in the database.",
                "data": {}
            }
        ), 
        400
    ) 


def user_profile_update_user(objectId, data):
    '''
    Updates user in the User database
    '''

    fields = ['email', 'first_name', 'last_name', 'payment_methods', 'shipping_address', 'spotify_id', 'cart']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {
                        "message": "User object is invalid.",
                        "data": {}
                    }
                ), 
                400
            ) 
    
    if User.valid_email(data['email']) and User.valid_name(data['first_name']) and User.valid_name(data['last_name']):
        values = { 
            'email': data['email'],
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'payment_methods': data['payment_methods'],
            'shipping_address': data['shipping_address'],
            'spotify_id': data['spotify_id'],
            'cart': data['cart']
        }
        
        User.update_user_attributes('_id', objectId, values)
        
        return make_response(
            dumps(
                {
                    "message": "Success.",
                    "data": {}
                }
            ), 
            201
        ) 
        
    return make_response(
        dumps(
            {
                "message": "User object is invalid.",
                "data": {}
            }
        ), 
        400
    ) 

def user_profile_update_user_password(objectId, data):
    '''
    Updates user in the User database
    '''
    fields = ['old_password', 'new_password']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {
                        "message": "User object is invalid.",
                        "data": {}
                    }
                ), 
                400
            ) 

    old_password = data['old_password']
    new_password = data['new_password']

    # Obtain user from database
    user = User.find_user_by_attribute("_id", objectId)
    if user:
        if check_password_hash(user.password, old_password): 
            User.update_user_attribute("_id", objectId, "password", generate_password_hash(new_password))
            
            return make_response(
                dumps(
                    {
                        "message": "success",
                        "data": {}
                    }
                ), 
                201
            ) 
        else:
            # returns 403 if password is wrong 
            return make_response(
                dumps(
                    {
                        "message": "Incorrect password.",
                        "data": {}
                    }
                ), 
                403
            ) 

    return make_response(
        dumps(
            {
                "message": "User does not exist in the database.",
                "data": {}
            }
        ), 
        400
    ) 

def cart_user_cart_add(userId, data):
    '''
    Adds quantity of product_id to user's cart
    '''
    # Check that data contains product_id and quantity
    fields = ['product', 'quantity']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {
                        "message": "product and quantity required to add product to cart.",
                        "data": {}
                    }
                ), 
                400
            ) 

    product = data['product']
    quantity = data['quantity']

    # Check if valid product
    try:
        product_id = product['_id']
    except:
        return make_response(
            dumps(
                {
                    "message": "Invalid Product.",
                    "data": {}
                }
            ), 
            400
        )  

    # Check if valid quantity
    try: 
        quantity = int(quantity)
    except:
        return make_response(
            dumps(
                {
                    "message": "Invalid quantity.",
                    "data": {}
                }
            ), 
            400
        )  

    # Check if product_id exists in the database
    product = Product.get_product(criteria={'_id': ObjectId(product_id)})
    if not product:
        return make_response(
            dumps(
                {
                    "message": "Product does not exist in the database.",
                    "data": {}
                }
            ), 
            400
        ) 

    # Check valid user
    user = User.find_user_by_attribute("_id", userId)
    if not user:
        return make_response(
            dumps(
                {
                    "message": "User does not exist in the database.",
                    "data": {}
                }
            ), 
            400
        ) 

    # Check enough stock left
    if quantity + User.get_cart_product_quantity(userId, product_id) > int(product.stock):
        return make_response(
            dumps(
                {
                    "message": f"Sorry, there are only {product.stock} left.",
                    "data": {}
                }
            ), 
            400
        ) 

    # Update cart
    User.add_to_cart(userId, product_id, quantity)

    return make_response(
        dumps(
            {
                "message": "Success.",
                "data": {}
            }
        ), 
        201
    ) 

def cart_user_cart_edit(userId, data):
    '''
    Edits user's cart
    '''
    # Check that data contains cart
    fields = ['cart']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {
                        "message": "cart required to edit cart.",
                        "data": {}
                    }
                ), 
                400
            ) 

    cart = data['cart']

    # Check valid user
    user = User.find_user_by_attribute("_id", userId)
    if not user:
        return make_response(
            dumps(
                {
                    "message": "User does not exist in the database.",
                    "data": {}
                }
            ), 
            400
        ) 

    # For item in cart, check enough stock left
    for item in cart:
        # Check if product_id exists in the database
        product_id = item['product']['_id']
        product = Product.get_product(criteria={'_id': ObjectId(product_id)})
        if not product:
            return make_response(
                dumps(
                    {
                        "message": f"Product {product_id} does not exist in the database.",
                        "data": {}
                    }
                ), 
                400
            ) 
        
        # Check if valid quantity
        try: 
            quantity = int(item['quantity'])
        except:
            return make_response(
                dumps(
                    {
                        "message": "Invalid quantity.",
                        data: {}
                    }
                ), 
                400
            ) 

        # Check enough stock left
        if quantity > int(product.stock):
            return make_response(
                dumps(
                    {
                        "message": f"Sorry, there are only {product.stock} of product {product._id} left.",
                        "data": {}
                    }
                ), 
                400
            ) 

    # Update cart
    new_cart = []
    for item in cart:
        new_cart.append({'product_id': item['product']['_id'], 'quantity': int(item['quantity'])})

    User.update_user_attribute("_id", userId, "cart", new_cart)

    return make_response(
        dumps(
            {
                "message": "Success.",
                "data": {}
            }
        ), 
        201
    ) 

