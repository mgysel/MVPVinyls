from objects.productObject import Product
from objects.userObject import User
from objects.orderObject import Order
from flask import Flask, request
from bson.objectid import ObjectId
from bson.errors import InvalidId
import json
import re
from jellyfish import levenshtein_distance as ld
from dateutil.relativedelta import *
from datetime import datetime


def get_chatbot_options(current_user):
    '''
    Return a list of chatbot options as well as the user's name for personalised message
    '''
    data = {
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "options": ['product', 'warranty', 'delivery']
    }
    return {"data": data, "message": "Success."}, 200


def search_chatbot_query(current_user, data):
    '''
    Inputs a query type and message. 
    Returns message and products/orders for chatbot to display.
    For product query, returns three most relevant products.
    For delivery query, returns estimated delivery date and order object.
    For warranty query, returns warranty expiry date and product/order object as relevant.
    '''
    # check valid query
    if not data:
        return {"message": "Missing query payload."}, 400

    if not data['type']:
        return {"message": "Missing query type."}, 400
    
    if not data['message']:
        return {"message": "Missing query message."}, 400

    if data['type'] == 'product':
        # default values for search
        query = data['message'].lower()
        data = {
            "products": Product.many_to_json_str(_get_products(query, 3))
        }

    elif data['type'] == 'warranty':
        # products have 1 year warranty
        # search for product order
        # calculate how much warranty is left from order date
        # if product not in product order, give generic "1 year warranty"
        query = data['message'].lower()

        # Get product based on search query
        products = _get_products(query, 1)
        if len(products) == 0:
            return {"message": "No product found"}, 400
        product = products[0]

        # Get order for product
        order = Order.find_order_by_user_product(current_user._id, product._id)
        if order:
            expiry = order.date + relativedelta(years=+1)
            data = {
                "reply": f"Warranty for {product.album['name']} expires {expiry.strftime('%d %B %Y')}",
                "date": expiry,
                "order": Order.to_json(order),
                "product": {}
            }

        # No order containing product was found, return generic warranty notice
        else:
            data = {
                "reply": f"{product.album['name']} has a 1 year warranty",
                "date": datetime.now() + relativedelta(years=+1),
                "order": {},
                "product": Product.to_json_str(product)
            }

    elif data['type'] == 'delivery':
        # orders have 4 business day delivery turnover
        # search for order
        # calculate how many days left from order date
        # if no order found, give generic "4 business day"
        order_id = data['message']

        # Get all orders for user
        try:
            order = Order.find_order_by_attribute("_id", ObjectId(order_id))
        except InvalidId:
            return {"message": "Invalid order ID."}, 400
        
        # Check if order exists
        if order and order.user_id == current_user._id:
            delivery = order.date + relativedelta(days=+4)
            data = {
                "reply": f"Estimated delivery date for order number {order_id} is {delivery.strftime('%d %B %Y')}",
                "date": delivery,
                "order": Order.to_json(order)
            }
        
        else:
            return {"message": "No such order found."}, 400

    else:
        return {"message": "Invalid query type."}, 400

    return {"data": data, "message": "Success."}, 200


def _get_products(query, n):
    """
    Get the most relevant search results for a query
    """
    # Relevance sorting function
    def rank(x):
        # weight album match first, then artist, then song
        # substring is guaranteed due to database lookup
        album = ld(query, x.album['name'].lower())

        artist_lds = [ld(query, a['name']) for a in x.artists]
        artist = min(artist_lds) * 2

        song_lds = [ld(query, s['name']) for s in x.songs]
        songs = min(song_lds) * 3

        return min([album, artist, songs])

    # Search database with default filters
    query = query.lower()
    qtype = ''
    page = '1'
    sort = 'ascending'
    order_by = 'alphabetical'
    genres = ''.split(',')
    products = Product.get_products_from_search(query,qtype,page,sort,order_by,genres)

    # Return n most relevant products
    return sorted(products, key=rank)[:n]

