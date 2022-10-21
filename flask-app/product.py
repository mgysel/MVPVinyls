from objects.productObject import Product
from objects.userObject import User
from flask import Flask, request, redirect, url_for, make_response, jsonify
from bson.objectid import ObjectId
from bson.errors import InvalidId
import json
import re

def get_recommendations_for_one(product_id):
    '''
    Gets recommendations according to one product id.
    '''
    try:
        obj_id = ObjectId(product_id)
        product = Product.get_product({"_id" : { "$eq" : ObjectId(product_id)}})
        if product:
            reccommendations = product.get_recommendations()
            reccommendations_json = Product.many_to_json_str(reccommendations)
            return make_response(jsonify({
                "data": reccommendations_json,
                "message": "Success."
                }), 200)
        return make_response(
            jsonify({
                "message" :"Could not find product."
            }), 404)
    except:
        return make_response(
            jsonify({
                "message" :"Could not find product."
            }), 404)

def get_recommendations_from_top_spotify(request):
    '''
    Handles OAuth, with status request, where a Spotify OAuth URL will be returned, and retrieves
    the recommendations for a user as per their top artist's genres.
    '''
    recommendations = Product.get_recommendations_from_top_spotify(request)
    if recommendations:
        if recommendations['status'] == 'success':
            recommended_json = Product.many_to_json_str(recommendations['recommendations']['recommended'])
            suggested_json = Product.many_to_json_str(recommendations['recommendations']['suggested'])
            return make_response(
                jsonify({
                    "data": {
                        'recommended':recommended_json,
                        'suggested':suggested_json
                    }, 
                    "message" : "Success.",
                    "status": "success",
                }), 200)
        elif recommendations['status'] == 'request':
            return make_response(
                jsonify({
                    "data":recommendations['url'], 
                    "message" : "Request url for user's spotify information.",
                    "status": "request",
                }), 200)

    else:
        return make_response(
            jsonify({
                "message" : "There was an error attempting to retrieve recommendations. Please try again.",
                "status": "error",
            }), 400)

def get_recommendations_from_orders(request, current_user):
    '''
    Gets recommendations as per the genres of the products in the user's previous orders.
    '''
    recommendations = Product.get_recommendations_from_orders(request, current_user)
    if recommendations:
        recommended_json = Product.many_to_json_str(recommendations['recommended'])
        suggested_json = Product.many_to_json_str(recommendations['suggested'])
        return make_response(
            jsonify({
                "data": {
                    'recommended':recommended_json,
                    'suggested':suggested_json
                }, 
                "message" : "Success.",
                "status": "success",
            }), 200)
    else:
        return make_response(
            jsonify({
                "message" : "There was an error attempting to retrieve recommendations. Please try again.",
                "status": "error",
            }), 400)

def authenticate_spotify(request):
    '''
    Optional endpoint for authenticating a user on Spotify with the backend.
    Tokens are stored in a cache. The function get_recommendations_from_top_spotify replaces this.
    '''
    if Product.authenticate_spotify(request):
        return make_response(
            jsonify({
                "message" :"Successfully authorised.",
            }), 200)

    else:
        return make_response(
            jsonify({
                "message" :"Authorisation from spotify failed. Please try again.",
            }), 401)

def add_product(current_user,product_json):
    '''
    Adds a product to the MongoDB instance according to a JSON input which can be converted directly to a Product object.
    '''
    if not current_user.is_admin:
        return make_response(
            jsonify({
                "message" :"Unauthorised, this feature is only used by admins.",
            }), 401)
    if "_id" in product_json:
        return make_response(
            jsonify({
                "message" :"Adding product failed, do not supply product ID when adding.",
            }), 400)
    product = Product.from_json_new_product(product_json)       
    if product:
        id = Product.insert_one(product)
        if id:
            return make_response(
                jsonify({
                    "data" : {"id":str(id)}, 
                    "message" : "Success.",
                }), 200)
        return make_response(
            jsonify({
                "message": "Adding product failed.",
            }), 400)
    return make_response(
            jsonify({
                "message": "Invalid product object passed."
            }), 400)

def get_admin_products(current_user):
    '''
    Gets all products, whilst checking if the user has permissions to do so.
    '''
    if not current_user.is_admin:
        return make_response(
            jsonify({
                "message" :"Unauthorised, this feature is only used by admins."
            }), 401)
    all_products = Product.many_to_json_str(Product.get_all_products({}))
    if all_products:
        return make_response(
            jsonify({
                "data":all_products, 
                "message" : "Success.",
            }), 200)
    return make_response(
        jsonify({
            "message" :"Viewing all products failed."
        }), 500)
    

def get_products_from_search(args):
    '''
    Retrieves all products as per search criteria.
    '''
    # check for invalid parameter names
    valid_params = {'q','type','page','sort','order_by','genre'}
    invalid_params = list(set(args.keys()) - valid_params)
    if invalid_params:
        return { "mesage" : "Invalid parameter passed." }, 400

    # get all parameters from query string
    query = args.get('q', '').lower()
    qtype = args.get('type', '').lower()
    page = args.get('page', '1')
    sort = args.get('sort', 'ascending').lower()
    order_by = args.get('order_by', 'alphabetical').lower()
    genres = args.get('genre', '').lower().split(',')

    # check valid query type
    if qtype and qtype not in Product.QTYPE_DEF.keys():
        return { "mesage" : "Invalid query type." }, 400

    # check valid page number
    if not page.isdigit():
        return { "mesage" : "Invalid page number." }, 400
    
    # check valid sort
    if sort not in Product.SORT_DEF.keys():
        return { "mesage" : "Invalid sort direction." }, 400

    # check valid order_by
    if order_by not in Product.ORDER_DEF.keys():
        return { "mesage" : "Invalid order key." }, 400

    products = Product.get_products_from_search(query,qtype,page,sort,order_by,genres)
    product_list = Product.many_to_json_str(products)

    num_genres = 5
    genre_list = Product.get_top_genres_from_search(query,qtype,num_genres,genres)

    total_items = Product.get_num_search_results(query,qtype,genres)
    search_obj = {
        "product_list": product_list,
        "genre_list": genre_list,
        "total_items": str(total_items)
    }
    return {"data": search_obj, "message": "Success."}, 200


def get_product(product_id):
    '''
    Retrieves a single product per an id.
    '''
    try:
        obj_id = ObjectId(product_id)
        product = Product.get_product({"_id": { "$eq": ObjectId(product_id)}})
        if product:
            return {"data": product.to_json_str(), "message": "Success."}, 200
        return {"message": "Could not find product."}, 404
    except:
        return {"message": "Could not find product."}, 404

def edit_product(current_user, payload,product_id):
    '''
    Updates a product's details as per the properties specified in the payload.
    Only an existing product can be edited.
    '''
    try:
        if not current_user.is_admin:
            return {"message": "Unauthorised, this feature is only used by admins."}, 401
        obj_id = ObjectId(product_id)
        product = Product.get_product({"_id": { "$eq": ObjectId(product_id)}})
        if product:
            edited_product = product.edit_product(payload)
            if edited_product:
                return {
                    "message": "Successfully edited product.",
                    "data": edited_product.to_json_str()
                    }, 200
            return {
                "message": "Invalid properties passed to edit.",
                }, 400
        return {"message": "Could not find original product to edit."}, 404
    except InvalidId as e:
        return {"message": "Could not find original product to edit."}, 404


def delete_product(current_user,product_id):
    '''
    Deletes a product from the MongoDB instance if the current user has privileges to do so.
    '''
    try:
        if not current_user.is_admin:
            return {"message": "Unauthorised, this feature is only used by admins."}, 401
        obj_id = ObjectId(product_id)
        product = Product.get_product({"_id": { "$eq": ObjectId(product_id)}})
        if product:
            product.delete_product()
            return {
                "message": "Successfully deleted product.",
                }, 200
        return {"message": "Could not find original product to delete."}, 404
    except InvalidId as e:
        return {"message": "Could not find original product to delete."}, 404

