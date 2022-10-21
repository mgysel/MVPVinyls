from flask import Flask, request, redirect, url_for, make_response, jsonify
import json
from json import dumps
import stripe

from bson.objectid import ObjectId

from objects.userObject import User
from objects.productObject import Product

from datetime import datetime

import re

# Obtain API KEY
class CredentialsError(Exception):
    def __init__(self, message):
        self.message = message

try:
    with open('credentials/credentials.json', 'r') as creds_file:
        credentials = json.load(creds_file)
    if "stripe_api_secret_key" not in credentials:
        raise CredentialsError("Credentials file not valid")
    else:
        stripe.api_key = credentials['stripe_api_secret_key']
except:
    raise CredentialsError("Credentials file not valid")

def is_valid_url(url):
    '''
    Checks if url is valid
    Returns True if valid
    Returns False otherwise
    Original code from: https://www.geeksforgeeks.org/check-if-an-url-is-valid-or-not-using-regular-expression/
    '''
    # Regex to check valid URL
    regex = ("((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)")
     
    # Compile the ReGex
    p = re.compile(regex)
 
    # If the string is empty
    # return false
    if (url == None):
        return False
 
    # Return if the string
    # matched the ReGex
    if (re.search(p, url)) or "localhost" in url or "127.0.0.1" in url:
        return True
    else:
        return False

def create_checkout_session(userId, data):
    '''
    Creates checkout session for user
    '''
    # Check data object is valid
    fields = ['success_url', 'cancel_url']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {
                        "message": "Checkout object requires success_url and cancel_url.",
                        "data": {}
                    }
                ), 
                400
            ) 

    data_success_url = data['success_url']
    data_cancel_url = data['cancel_url']

    # Checks valid success_url
    if not is_valid_url(data_success_url):
        return make_response(
            dumps(
                {
                    "message": "Invalid Success URL.",
                    "data": {}
                }
            ), 
            400
        ) 

    # Check valid cancel_url
    if not is_valid_url(data_cancel_url):
        return make_response(
            dumps(
                {
                    "message": "Invalid Cancel URL.",
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

    # Check cart is not empty
    if len(user.cart) == 0:
        return make_response(
            dumps(
                {
                    "message": "User cart is empty.",
                    "data": {}
                }
            ), 
            400
        ) 

    # Convert user cart to Stripe line_items
    user_line_items = []
    for item in user.cart:
        # Get product
        product_id = item['product_id']
        product = Product.get_product(criteria={'_id': ObjectId(product_id)})

        # Check product exists in database
        if not product:
            return make_response(
                dumps(
                    {
                        "message": f"Product {item['product_id']} does not exist in the database.",
                        "data": {}
                    }
                ), 
                400
            ) 

        try: 
            product_price = int(float(product.price)*100)
        except:
            return make_response(
                dumps(
                    {
                        "message": f"Product {item['product_id']} price invalid.",
                        "data": {}
                    }
                ), 
                400
            ) 

        user_line_items.append(
            {
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': product_price,
                    'product_data': {
                        'name': product.album['name'],
                        #'images': product.images,
                    }
                },
                'quantity': item['quantity'],
            }
        )

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=user_line_items,
            mode='payment',
            success_url = data_success_url + "?success=true",
            cancel_url = data_cancel_url,
        )
        
        # Return checkout session's ID to reference the session in the client
        return make_response(
            dumps(
                {
                    "message": "success",
                    "data": {
                        "id": checkout_session.id
                    }
                }
            ), 
            201
        ) 
    except Exception as e:
        print("Creating a checkout session failed on the backend.")
        print(e)

        return make_response(
            dumps(
                {
                    "message": f"Stripe error: {e}",
                    "data": {}
                }
            ), 
            400
        ) 