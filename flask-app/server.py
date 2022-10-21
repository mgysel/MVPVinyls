from flask import Flask, request, redirect, url_for
from flask_mail import Mail, Message
from flask_cors import CORS
from bson.objectid import ObjectId
# imports for PyJWT authentication
import jwt
from json import dumps, load
from functools import wraps
import sys
from werkzeug.security import generate_password_hash

class CredentialsError(Exception):
    def __init__(self, message):
        self.message = message

APP = Flask(__name__)
# Allows cross-origin AJAX, so React can talk to this API
CORS(APP)

APP.config['SECRET_KEY'] = 'your secret key'

# Load email credentials and set up mail server
try:
    with open('credentials/credentials.json', 'r') as creds_file:
        credentials = load(creds_file)
    if "mail_server" not in credentials or "mail_port" not in credentials or "mail_username" not in credentials or "mail_password" not in credentials:
        raise CredentialsError("Credentials file not valid")
    else:
        APP.config['MAIL_SERVER'] = credentials['mail_server']
        APP.config['MAIL_PORT'] = credentials['mail_port']
        APP.config['MAIL_USE_SSL'] = True
        APP.config['MAIL_USERNAME'] = credentials['mail_username']
        APP.config['MAIL_PASSWORD'] = credentials['mail_password']
except:
    raise CredentialsError("Credentials file not valid")

mail = Mail(APP)

from auth import auth_register, auth_login, auth_request, auth_reset
from product import get_recommendations_for_one,get_recommendations_from_top_spotify, get_recommendations_from_orders, add_product, get_products_from_search, get_product, get_admin_products, authenticate_spotify, edit_product, delete_product
from user import get_user_profile, user_profile_update_user, user_profile_update_user_password, cart_user_cart_add, cart_user_cart_edit
from admin import promote_user, demote_user, search_user, fulfill_order
from payments import create_checkout_session
from chatbot import get_chatbot_options, search_chatbot_query
from order import order_add_order, order_get_user_order, order_get_order_order, order_get_orders_search
from dashboard import revenue_dashboard, customers_dashboard
from objects.userObject import User
from flask.json import jsonify
import json
from flask.helpers import make_response

import stripe



########## AUTH ROUTES ##########

# decorator for verifying the JWT 
def token_required(f): 
    '''
    Decorator for verifying the JWT
    Use of JWT references:
    https://www.geeksforgeeks.org/using-jwt-for-user-authentication-in-flask/
    '''
    @wraps(f) 
    def decorated(*args, **kwargs): 
        token = None
        # jwt is passed in the request header 
        if 'x-access-token' in request.headers: 
            token = request.headers['x-access-token'] 
        # return 401 if token is not passed 
        if not token: 
            return jsonify({'message' : 'Token is missing.'}), 401
   
        print("********** DECORATOR - TOKEN **********")
        print(token)
        print("********** DECORATOR - DECODED TOKEN **********")
        print(f"SERET KEY: {APP.secret_key}")
        print(jwt.decode(token, APP.secret_key, algorithms="HS256")) 

        try: 
            # decoding the payload to fetch the stored details 
            data = jwt.decode(token, APP.secret_key, algorithms="HS256") 
            
            # TODO - Obtain id of user from database
            print("********** DATA **********")
            print(data)
            current_user = User.find_user_by_attribute("_id", ObjectId(data['id']))
            print("********** CURRENT USER **********")
            print(current_user)
            #find_user_by_attribute(cls, attribute, user_attribute)
            #current_user = User.query.filter_by(public_id = data['public_id']).first() 
        except: 
            return make_response(
                dumps(
                    {"message": "Token is invalid."}
                ), 
                401
            ) 
        # returns the current logged in users contex to the routes 
        return  f(current_user, *args, **kwargs) 
   
    return decorated 


@APP.route('/auth/register', methods=['POST'])
def register_user():
    '''
    Registers a user
    '''
    data = request.get_json()
    result = auth_register(data, APP.secret_key)
    return result


@APP.route('/auth/login', methods=['POST'])
def login_user():
    '''
    Logs in a user
    '''
    data = request.get_json()
    result = auth_login(data, APP.secret_key)
    return result


'''
To logout, tokens should be removed from the client side cookie
https://stackoverflow.com/questions/21978658/invalidating-json-web-tokens
@APP.route('/auth/logout', methods=['POST'])
def logout_user():
    data = request.get_json()
    result = auth_logout(APP.secret_key)
    return result
'''


@APP.route('/auth/reset/request', methods=['POST'])
def reset_request():
    '''
    Inputs user email and sets request for password reset, 
    emails code for reset to email of user
    '''
    data = request.get_json()
    print(data)

    fields = ['email']
    for field in fields:
        if not field in data:
            return make_response(
                dumps(
                    {"message": "User object is invalid."}
                ), 
                400
            ) 
    
    email = data['email']

    # Check - record of email in database
    if User.unused_email(email):
        return make_response(
            dumps(
                {"message": "We have no record of your email in the database."}
            ), 
            400
        ) 

    reset_code = auth_request(email)

    sender = credentials['mail_username']
    recipients = [email]
    subject = "Your Password Reset Code"
    body = f'''
    It looks like you forgot your password. Please use the reset code {reset_code} to reset your password.
    '''
    message = Message(subject, sender=sender, recipients=recipients, body=body)

    mail.send(message)

    return make_response(
        dumps(
            {
                "reset_code": reset_code,
                "message": "Success."
            }
        ), 
        201
    ) 


@APP.route('/auth/reset/reset', methods=['POST'])
def reset_reset():
    '''
    Takes in an email, reset_code, and password 
    then attempts to change password for the corresponding user
    '''
    data = request.get_json()
    result = auth_reset(data, APP.secret_key)
    return result




########## USER ROUTES ##########
@APP.route('/user/profile', methods=['GET'])
@token_required
def user_profile(current_user):
    '''
    Inputs a user object
    Returns user object if valid JWT
    '''
    response = get_user_profile(current_user._id)
    return response


@APP.route('/user/profile/editUser', methods=['PUT'])
@token_required
def user_profile_edit_user(current_user):
    '''
    Takes in a user object
    Edits user object
    '''
    data = request.get_json()
    response = user_profile_update_user(current_user._id, data)
    return response


@APP.route('/user/profile/editUserPassword', methods=['PUT'])
@token_required
def user_profile_edit_user_password(current_user):
    '''
    Takes in a user object
    Edits user password
    '''
    data = request.get_json()
    response = user_profile_update_user_password(current_user._id, data)
    return response


@APP.route('/user/cart/add', methods=['POST'])
@token_required
def user_cart_add(current_user):
    '''
    Inputs a user object
    Requests product_id and quantity
    Adds product to corresponding user shopping cart
    Returns user shopping cart
    '''
    data = request.get_json()
    response = cart_user_cart_add(current_user._id, data)
    return response


@APP.route('/user/cart/edit', methods=['PUT'])
@token_required
def user_cart_edit(current_user):
    '''
    Inputs a user object
    Requests user shopping cart
    Updates corresponding user shopping cart
    Returns user shopping cart
    '''
    data = request.get_json()
    response = cart_user_cart_edit(current_user._id, data)
    return response



########## PAYMENT ROUTES ##########
@APP.route('/payments/create-checkout-session', methods=['POST'])
@token_required
def payments_create_checkout_session(current_user):
    '''
    Creates Stripe checkout session for user
    Inputs user, success and cancel urls
    Outputs checkout session
    '''
    # Angus gives me user - should he give me success/cancel urls?
    data = request.get_json()
    response = create_checkout_session(current_user._id, data)
    return response



########## PRODUCT ROUTES ##########
@APP.route('/product/<product_id>', methods=['GET'])
def product(product_id):
    '''
    Inputs a product id
    Returns corresponding product object
    '''
    return get_product(product_id)


@APP.route('/product/<product_id>/recommend', methods=['GET'])
def recommend(product_id):
    '''
    Inputs a product id
    Finds all recommendations for that product
    Returns a list of product objects which were recommended
    '''
    response = get_recommendations_for_one(product_id)
    return response


@APP.route('/product/recommend_top_spotify', methods=['GET'])
def recommend_top_spotify():
    '''
    No inputs needed here, all information is gained from the request url
    Spotify OAuth token is attempted to be found by looking in the cache or the URL
    If it cant be found, returns a authorisation URL for the frontend to handle
    If it can be found, 
    Returns a list of products which were recommended based on the user's top artists
    and a list of suggestions that the user might like to explore
    '''
    response = get_recommendations_from_top_spotify(request)
    return response


@APP.route('/product/recommend_orders', methods=['GET'])
@token_required
def recommend_orders(current_user):
    '''
    Inputs the current user
    Gets all preivous orders for this user
    Returns a list of products which were recommended based on previous orders
    and a list of suggestions that the user might like to explore
    '''
    response = get_recommendations_from_orders(request, current_user)
    return response


@APP.route('/product/search', methods=['GET'])
def search():
    '''
    Inputs a search query with the parameters: 'q','type','page','sort','order_by','genre'
    allowing for searching a certain type of data, sorting and filtering based on genre
    Filters and sorts MongoDB output based on query parameters
    Returns a list of products which satisfy the search criteria
    '''
    return get_products_from_search(request.args)


@APP.route('/spotify_callback',methods=['GET'])
def spotify_callback():
    '''
    Optional endpoint for authenticating user with Spotify
    '''
    response = authenticate_spotify(request)
    return response


@APP.route('/order/add', methods=['POST'])
@token_required
def order_add(current_user):
    '''
    Inputs a user object
    Requests order
    Adds order to orders database
    '''
    data = request.get_json()
    response = order_add_order(current_user._id, data)
    return response


@APP.route('/order/user', methods=['GET'])
@token_required
def order_get_user(current_user):
    '''
    Inputs a user object
    Returns all orders for that user
    '''
    response = order_get_user_order(current_user._id)
    return response


@APP.route('/order/<order_id>', methods=['GET'])
@token_required
def order_get_order(current_user, order_id):
    '''
    Inputs a user object
    Requests order_id
    Returns order with a given order_id
    '''
    response = order_get_order_order(current_user._id, order_id)
    return response


@APP.route('/order/search', methods=['GET'])
@token_required
def order_search(current_user):
    '''
    Inputs a user object
    Requests order_id and page
    Returns all orders for that given page
    '''
    response = order_get_orders_search(current_user._id, request.args)
    return response



########## ADMIN ROUTES ##########
@APP.route('/admin/products/add', methods=['POST'])
@token_required
def add_vinyl(current_user):
    '''
    Inputs a product object
    Inserts that product object into the database
    Returns a error message or success message
    '''
    data=request.get_json()
    return add_product(current_user, data)


@APP.route('/admin/products/edit/<product_id>', methods=['PUT'])
@token_required
def edit_vinyl(current_user, product_id):
    '''
    Inputs a product id and the properties that you wish to edit in the request JSON
    Updates the coreesponding product in the database
    Returns the new product json in the body or a failure if it could not find the product
    '''
    data=request.get_json()
    return edit_product(current_user, data, product_id)


@APP.route('/admin/products/remove/<product_id>', methods=['POST'])
@token_required
def remove_vinyl(current_user, product_id):
    '''
    Inputs a product id
    Deletes the corresponding product from the database
    Returns a error message if it could not find the product or success message
    '''
    return delete_product(current_user, product_id)


@APP.route('/admin/products', methods=['GET'])
@token_required
def admin_products(current_user):
    '''
    Gets all products with admin verification for admin panel
    '''
    return get_admin_products(current_user)


@APP.route('/admin/permissions/promote', methods=['PUT'])
@token_required
def admin_promote_user(current_user):
    '''
    Promotes a user to an admin
    '''
    data = request.get_json()
    response = promote_user(current_user, data)
    return response


@APP.route('/admin/permissions/demote', methods=['PUT'])
@token_required
def admin_demote_user(current_user):
    '''
    Demotes an admin to a user
    '''
    data = request.get_json()
    response = demote_user(current_user, data)
    return response


@APP.route('/admin/permissions/search', methods=['GET'])
@token_required
def admin_get_user(current_user):
    '''
    Inputs a search query with the parameters: 'q','page'
    to return a list users matching name or email
    '''
    return search_user(current_user, request.args)


@APP.route('/admin/dashboard/revenue', methods=['GET'])
@token_required
def admin_dashboard_revenue(current_user):
    '''
    Gets a revenue dashboard in recharts format if the user is admin
    '''
    return revenue_dashboard(current_user, request.args)


@APP.route('/admin/dashboard/customers', methods=['GET'])
@token_required
def admin_dashboard_customers(current_user):
    '''
    Gets a new customers dashboard in recharts format if the user is admin
    '''
    return customers_dashboard(current_user, request.args)


@APP.route('/admin/order/fulfill', methods=['PUT'])
@token_required
def admin_fulfill_order(current_user):
    '''
    Fulfills an order in the database
    '''
    data = request.get_json()
    response = fulfill_order(current_user, data)
    return response



########## CHATBOT ROUTES ##########
@APP.route('/chatbot/options', methods=['GET'])
@token_required
def chatbot_user_options(current_user):
    '''
    Return a list of chatbot options as well as the user's name for personalised message
    '''
    return get_chatbot_options(current_user)


@APP.route('/chatbot/query', methods=['POST'])
@token_required
def chatbot_user_query(current_user):
    '''
    Inputs a query type and message. 
    Returns message and products/orders for chatbot to display.
    For product query, returns three most relevant products.
    For delivery query, returns estimated delivery date and order object.
    For warranty query, returns warranty expiry date and product/order object as relevant.
    '''
    data = request.get_json()
    return search_chatbot_query(current_user, data)



if __name__ == "__main__":
    APP.run(port=(int(sys.argv[1]) if len(sys.argv) == 2 else 2119), debug=True)
