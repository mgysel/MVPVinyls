from flask import Flask, request, redirect, url_for, make_response, jsonify
import json
from json import dumps
from datetime import datetime

from bson.objectid import ObjectId

from objects.userObject import User
from objects.productObject import Product
from objects.orderObject import Order

from datetime import datetime

def order_add_order(userId, data):
    '''
    Adds order to order database
    '''
    # Check that data contains product_id and quantity
    fields = ['order', 'shipping_details']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {
                        "message": "Order and shipping details required to add order.",
                        "data": {}
                    }
                ), 
                400
            ) 

    order = data['order']
    shipping_details = data['shipping_details']
    
    # Check that each order object is valid
    fields = ['product', 'quantity']
    for item in order:
        for field in fields:
            if not field in item:
                return make_response(
                    dumps(
                        {
                            "message": "Product and quantity required for each order.",
                            "data": {}
                        }
                    ), 
                    400
                ) 
    
    # Check that shipping_details object is valid
    fields = ['first_name', 'last_name', 'street', 'city', 'postcode', 'state', 'email']
    for field in fields:
        if not field in shipping_details:
            return make_response(
                dumps(
                    {
                        "message": "First name, last name, street, city, postcode, state, and email required in shipping details.",
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

    # Add order to database
    date = datetime.now()
    fulfilled = False
    order = Order(None, userId, date, order, shipping_details, fulfilled)
    
    if Order.insert_one(order) is not None:
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
                "message": "Order could not be inserted into the database.",
                "data": {}
            }
        ), 
        400
    ) 

def order_get_user_order(userId):
    '''
    Gets all orders for user from database
    '''
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

    # Get all orders for user
    orders = Order.find_orders_by_attribute("user_id", userId)

    if orders:
        orders_json = Order.many_to_json(orders)
        return make_response(
            dumps(
                {
                    "message": "Success.",
                    "data": {"orders": orders_json}
                }
            ), 
            201
        ) 

    return make_response(
        dumps(
            {
                "message": "Orders do not exist in the database for that user.",
                "data": {}
            }
        ), 
        400
    )

def order_get_order_order(userId, order_id):
    '''
    Gets order by order_id
    '''
    # Check valid order_id
    try:
        order_id = ObjectId(order_id)
    except:
        return make_response(
            dumps(
                {
                    "message": "Invalid order_id.",
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

    # Get all orders for user
    order = Order.find_order_by_attribute("_id", order_id)

    if order:
        order_json = Order.to_json(order)
        return make_response(
            dumps(
                {
                    "message": "Success.",
                    "data": {"order": order_json}
                }
            ), 
            201
        ) 

    return make_response(
        dumps(
            {
                "message": "Order does not exist in the database for that order id.",
                "data": {}
            }
        ), 
        400
    )


def order_get_orders_search(userId, data):
    '''
    Gets orders by page number
    Orders are sorted by most recent
    '''
    # Check that data contains page
    fields = ['page']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {
                        "message": "Page number required.",
                        "data": {}
                    }
                ), 
                400
            ) 
    
    # Make sure page number is valid
    page = data['page']
    try:
        page = int(page)
        if (page < 1):
            return make_response(
                dumps(
                    {
                        "message": "Invalid page number.",
                        "data": {}
                    }
                ), 
                400
            )  
    except:
        return make_response(
            dumps(
                {
                    "message": "Invalid page number.",
                    "data": {}
                }
            ), 
            400
        )  

    # Obtain search order_id
    order_id = None
    if 'order_id' in data:
        order_id = data['order_id']

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

    # Get the page-th page of orders
    # Each page is 10 orders
    orders = Order.search_orders(order_id, page)

    orders_json = Order.many_to_json(orders)
    return make_response(
        dumps(
            {
                "message": "Success.",
                "data": {"orders": orders_json}
            }
        ), 
        201
    ) 