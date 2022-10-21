from flask import Flask, request, redirect, url_for, make_response, jsonify
from flask_mail import Mail, Message
from json import dumps
from werkzeug.security import generate_password_hash, check_password_hash
# imports for PyJWT authentication
import jwt
from datetime import datetime, timedelta 
from functools import wraps

from objects.userObject import User

# TODO - How get the APP secret key from server.py?

# Database
#from objects.MongoWrapper import MongoWrapper

#from server import APP, mail

import re
import uuid
from email.message import Message
from flask.templating import render_template
from objects.userObject import User


########## MAIN FUNCTIONS ##########

def auth_login(data, secret_key):
    '''
    Inputs user email/password
    If valid email/password, logs in a user and returns JWTtoken
    Use of JWT references:
    https://www.geeksforgeeks.org/using-jwt-for-user-authentication-in-flask/
    '''
    fields = ['email', 'password']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {"message": "User object is invalid."}
                ), 
                400
            ) 

    email = data['email']
    password = data['password']

    if not User.valid_email(email) or not User.valid_password(password): 
        # returns 401 if email/password not valid
        return make_response(
            dumps(
                {"message": "Invalid email or password."}
            ), 
            401
        ) 
        
   
    # Obtain user from database
    user = User.find_user_by_attribute("email", email)
   
    if not user: 
        # returns 401 if user does not exist 
        return make_response(
            dumps(
                {"message": "User does not exist."}
            ), 
            401
        ) 

    if check_password_hash(user.password, password): 
        
        # generates the JWT Token 
        token = jwt.encode({ 
            'id': str(user._id),
            # Token valid for 30 days
            'exp' : datetime.utcnow() + timedelta(days = 30) 
        }, secret_key) 

        return make_response(
            dumps(
                {
                    "token": token,
                    "message": "Success."
                }
            ), 
            201
        ) 
    
    # returns 403 if password is wrong 
    return make_response(
        dumps(
            {"message": "Incorrect email or password."}
        ), 
        403
    ) 


def auth_register(data, secret_key):
    '''
    Inputs email, password, first name, and last name
    Attempts to create new user
    Errors from invalid email, email taken, password < 6 characters,
    first or last name being ouside of 1 to 50 range
    '''
    fields = ['email', 'password', 'first_name', 'last_name', 'confirm_password']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {"message": "User object is invalid."}
                ), 
                400
            ) 

    email = data['email']
    password = data['password']
    first_name = data['first_name']
    last_name = data['last_name']
    confirm_password = data['confirm_password']
    # Check - valid email
    if not User.valid_email(email):
        return make_response(
            dumps(
                {"message": "Invalid Email Address."}
            ), 
            400
        ) 

    # Check - unused email
    if not User.unused_email(email):
        return make_response(
            dumps(
                {"message": "Email Address already taken."}
            ), 
            400
        ) 

    # Check - valid password
    if not User.valid_password(password):
        return make_response(
            dumps(
                {"message": "Password must be longer than 6 characters."}
            ), 
            400
        ) 
    if not User.valid_matching_passwords(password, confirm_password):
        return make_response(
            dumps(
                {"message": "Passwords must match."}
            ), 
            400
        ) 

    # Checks first and last name are between 1 and 51 characters
    if not User.valid_name(first_name):
        return make_response(
            dumps(
                {"message": "First name must be between 1 and 50 characters."}
            ), 
            400
        ) 

    if not User.valid_name(last_name):
        return make_response(
            dumps(
                {"message": "Last name must be between 1 and 50 characters."}
            ), 
            400
        ) 

    # Create user object, add to database
    payment_methods = []
    shipping_address = []
    spotify_id = ""
    cart = []
    role = "user"
    reset_code = "-1"

    user = User(None, email, generate_password_hash(password), first_name, last_name, payment_methods, shipping_address, spotify_id, cart, role, reset_code)
    User.insert_one(user)

    # Log user in once registered
    data = {
        'email': email,
        'password': password
    }
    return auth_login(data, secret_key)
    

'''
To logout, tokens should be removed from the client side cookie
https://stackoverflow.com/questions/21978658/invalidating-json-web-tokens
def auth_logout(token, secret_key):
    @token_required(secret_key)
'''


########## JUST USE RESET CODE ##########
def auth_request(email):
    '''
    Inputs user email
    If user email found in database, sends code to user's email
    If user email not found in database, raises Exception
    Use of JWT/Mail in password reset references:
    https://medium.com/@stevenrmonaghan/password-reset-with-flask-mail-protocol-ddcdfc190968
    '''
    # Obtain user from database
    user = User.find_user_by_attribute("email", email)

    # Create and store hash of reset_code
    reset_code = str(uuid.uuid4())
    User.update_user_attribute("email", email, "reset_code", generate_password_hash(reset_code))

    return reset_code

    

def auth_reset(data, secret_key):
    '''
    Inputs new user password
    If reset_code is correct, new password set
    If reset_code is incorrect, error
    '''
    fields = ['email', 'reset_code', 'password']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {"message": "User object is invalid."}
                ), 
                400
            ) 

    email = data['email']
    reset_code = data['reset_code']
    password = data['password']

    # Check - valid password
    if not User.valid_password(password):
        return make_response(
            dumps(
                {"message": "Password must be longer than 6 characters."}
            ), 
            400
        ) 
    
    # Obtain user from database
    user = User.find_user_by_attribute("email", email)
   
    if not user: 
        # returns 401 if user does not exist 
        return make_response(
            dumps(
                {"message": "User does not exist."}
            ), 
            401
        ) 

    if check_password_hash(user.reset_code, reset_code): 

        # Update the password
        User.update_user_attribute("email", email, "password", generate_password_hash(password))
        # generates the JWT Token 
        token = jwt.encode({ 
            'id': str(user._id),
            # Token valid for 30 days
            'exp' : datetime.utcnow() + timedelta(days = 30) 
        }, secret_key) 
   
        
        return make_response(
            dumps(
                {
                    "token": token,
                    "message": "Success."
                }
            ), 
            201
        ) 
    
    # returns 403 if reset_code is wrong 
    return make_response(
        dumps(
            {"message": "Incorrect email or reset_code."}
        ), 
        403
    ) 
