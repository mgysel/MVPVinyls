from flask import Flask, request, redirect, url_for, make_response, jsonify
from json import dumps
from bson.objectid import ObjectId

from objects.userObject import User
from objects.orderObject import Order

def promote_user(current_user, data):
    '''
    Promotes a user to an admin
    '''
    # Check that current_user is an admin
    if not current_user.is_admin():
        return make_response(
            dumps(
                {
                    "message": "The current user is not an administrator and cannot promote a user.",
                    "data": {}
                }
            ), 
            403
        ) 

    # Check that data is valid (contains _id)
    fields = ['_id']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {
                        "message": "Request is invalid.",
                        "data": {}
                    }
                ), 
                400
            ) 
    
    if not User.is_valid_id(data['_id']):
        return make_response(
                dumps(
                    {
                        "message": "Invalid user id.",
                        "data": {}
                    }
                ), 
                400
            ) 

    _id = ObjectId(data['_id'])
    user = User.find_user_by_attribute("_id", _id)

    # If the user exists in the database, promote to admin
    if user:
        if user.is_admin():
            return make_response(
                dumps(
                    {
                        "message": "The user is already an administrator.",
                        "data": {}
                    }
                ), 
                403
            ) 
        else:
            User.update_user_attribute("_id", _id, "role", "admin")
            return make_response(
            dumps(
                {
                    "message": "User updated to admin.",
                    "data": {}
                }
            ), 
                201
            ) 

    # If the user does not exist in the database
    return make_response(
        dumps(
            {
                "message": "User does not exist in the database.",
                "data": {}
            }
        ), 
        403
    ) 


def demote_user(current_user, data):
    '''
    Demotes an admin to a user
    '''
    # Check that current_user is an admin
    if not current_user.is_admin():
        return make_response(
            dumps(
                {
                    "message": "The current user is not an administrator and cannot demote a user.",
                    "data": {}
                }
            ), 
            403
        ) 

    # Check that data is valid (contains _id)
    fields = ['_id']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {
                        "message": "Request is invalid.",
                        "data": {}
                    }
                ), 
                400
            ) 
    
    if not User.is_valid_id(data['_id']):
        return make_response(
                dumps(
                    {
                        "message": "Invalid user id.",
                        "data": {}
                    }
                ), 
                400
            ) 

    _id = ObjectId(data['_id'])

    user = User.find_user_by_attribute("_id", _id)

    # If the user exists in the database, promote to admin
    if user:
        if not user.is_admin():
            return make_response(
                dumps(
                    {
                        "message": "The user is already a user.",
                        "data": {}
                    }
                ), 
                403
            ) 
        else:
            User.update_user_attribute("_id", _id, "role", "user")
            return make_response(
                dumps(
                    {
                        "message": "Admin updated to user.",
                        "data": {}
                    }
                ), 
                    201
            ) 

    # If the user does not exist in the database
    return make_response(
        dumps(
            {
                "message": "User does not exist in the database.",
                "data": {}
            }
        ), 
        403
    ) 


def fulfill_order(current_user, data):
    '''
    Fulfills an order in the database
    '''
    # Check that current_user is an admin
    if not current_user.is_admin():
        return make_response(
            dumps(
                {
                    "message": "The current user is not an administrator and cannot fulfill an order.",
                    "data": {}
                }
            ), 
            403
        ) 

    # Check that data is valid (contains order_id)
    fields = ['order_id']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {
                        "message": "order_id is required to fulfill an order.",
                        "data": {}
                    }
                ), 
                400
            ) 

    order_id = data['order_id']
    if not ObjectId.is_valid(order_id):
        return make_response(
            dumps(
                {
                    "message": "Invalid order_id.",
                    "data": {}
                }
            ), 
            400
        ) 

    order = Order.find_order_by_attribute("_id", ObjectId(order_id))

    # If the user exists in the database, promote to admin
    if order:
        Order.update_order_attribute("_id", ObjectId(order_id), "fulfilled", True)
        return make_response(
            dumps(
                {
                    "message": "Order fulfilled.",
                    "data": {}
                }
            ), 
            201
        ) 

    # If the user does not exist in the database
    return make_response(
        dumps(
            {
                "message": "Order does not exist in the database.",
                "data": {}
            }
        ), 
        403
    ) 


def search_user(current_user, args):
    '''
    Inputs a search query with the parameters: 'q','page'
    to return a list users matching name or email
    '''
    if not current_user.is_admin():
        return { "message": "The current user is not an administrator." }, 403
    
    query = args.get('q', '').lower()
    page = args.get('page', '1')
    
    if not page.isdigit():
        return { "message": "Invalid page number." }, 403

    users = User.find_users_from_search(query, page)
    user_list = [x.to_json() for x in users if x]
    return { "user_list": user_list }, 200
