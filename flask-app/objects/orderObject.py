from __future__ import annotations
import pymongo

# If we use the Flask Configuration
'''
import sys
sys.path
sys.path.append(".")
sys.path.append("..")
sys.path.append("./flask-app")
#from server import mongo
'''

from werkzeug.security import generate_password_hash
from objects.MongoWrapper import MongoWrapper
from objects.productObject import Product
from bson import ObjectId
import re


class Order:
    '''
    Order class that contains basic order info/methods
    '''
    def __init__(self, _id, user_id, date, order, shipping_details, fulfilled):
        self._id = _id
        self.user_id = user_id
        self.date = date
        self.order = order
        self.shipping_details = shipping_details
        self.fulfilled = fulfilled

    @staticmethod
    def from_json(order_json):
        '''
        Order json object to Order Object
        NOTE: converts product_id to product
        '''
        if order_json != None:
            properties = ['date', 'user_id', 'order', 'shipping_details', 'fulfilled']
            for prop in properties:
                if prop not in order_json:
                    return None
            
            _id = None
            if '_id' in order_json:
                _id = order_json['_id']

            try:
                for item in order_json['order']:
                    item['product'] = Product.get_product({'_id': item['product_id']})
                    del item['product_id']
            except:
                return None

            return Order(_id, order_json['user_id'], order_json['date'], order_json['order'], order_json['shipping_details'], order_json['fulfilled'])

    @staticmethod
    def to_json_db(self):
        '''
        order object to json object to be stored in database
        NOTE: converts product to product_id
        '''
        obj = self.__dict__
        if obj['_id'] == None:
            del obj['_id']
        else:
            obj['_id'] = str(obj['_id'])
        
        # Convert product to product_id before storing in db
        try:
            for item in obj['order']:
                item['product_id'] = ObjectId(item['product']['product_id'])
                del item['product']
        except:
            return None

        return obj

    @staticmethod
    def to_json(self):
        '''
        order object to json object
        NOTE: does not convert product to product_id
        '''
        obj = self.__dict__

        if obj['_id'] == None:
            del obj['_id']
        else:
            obj['_id'] = str(obj['_id'])

        if obj['user_id'] == None:
            del obj['user_id']
        else:
            obj['user_id'] = str(obj['user_id'])

        if obj['date'] is not None:
            obj['date'] = obj['date'].strftime("%m/%d/%Y, %H:%M:%S")

        # Convert product objects to json
        try:
            for item in obj['order']:
                product_json = Product.to_json_str(item['product'])
                item['product'] = product_json
        except: 
            return None

        return obj

    @staticmethod
    def many_to_json(orders: list[Order]):
        '''
        Convert a list of python Order objects to json objects
        NOTE: does not convert product to product_id
        '''
        l = []
        for order in orders:
            l.append(Order.to_json(order))
        return l
    
    @staticmethod
    def many_from_json(orders_json):
        '''
        Convert a list order json objects to Order objects
        NOTE: converts product_id to product
        '''
        products = Product.get_all_products()
        product_dict = {}
        for product in products:
            product_dict[product._id] = product
        orders = []
        for order_json in orders_json:
            if order_json != None:
                properties = ['date', 'user_id', 'order', 'shipping_details', 'fulfilled']
                for prop in properties:
                    if prop not in order_json:
                        return None
                
                _id = None
                if '_id' in order_json:
                    _id = order_json['_id']

                try:
                    for item in order_json['order']:
                        if item['product_id'] in product_dict:
                            item['product'] = product_dict[item['product_id']]
                            del item['product_id']
                except:
                    return None
            orders.append(Order(_id, order_json['user_id'], order_json['date'], order_json['order'], order_json['shipping_details'], order_json['fulfilled']))
        return orders

    @classmethod
    def is_valid_order(cls, order):
        '''
        Determines if order object is valid
        Returns True if valid, False otherwise
        '''
        # Check that cart object has _id and cart_items
        attributes = ['_id', 'user_id', 'date', 'order', 'shipping_details', 'fulfilled']
        for attribute in attributes:
            if not hasattr(order, attribute):
                return False

        return True

    def get_all_orders(self):
        '''
        Returns list of Order objects from the database
        '''
        db = MongoWrapper().client['vinyl_store']
        coll = db['orders']
        orders_json = list(coll.find())
        Order.many_from_json(orders_json)
        return orders

    @staticmethod
    def search_orders(order_id, page):
        '''
        Finds the page-th page of order objects
        One page is 10 orders, Orders sorted by date
        Returns list of Order objects from the database
        '''
        # 10 orders per page
        limit = 10
        skip = (int(page)-1)*limit
        field = "date"
        direction = -1

        db = MongoWrapper().client['vinyl_store']
        coll = db['orders']

        orders_json = []
        if order_id is None or order_id == "":
            # If no order_id given
            orders_json = list(coll.find(skip=skip, limit=limit).sort(field, direction))
        else:
            # If order_id given
            regex = f".*{order_id}.*"
            pipeline = [
                {
                    '$addFields': {
                        'temp_id': {
                            '$toString': '$_id'
                        }
                    }
                }, {
                    '$match': {
                        'temp_id': {
                            '$regex': regex, 
                            '$options': 'i'
                        }
                    }
                },
                {
                    '$sort': {
                        field: direction
                    }
                },
                {
                    '$skip': skip
                },
                {
                    '$limit': limit
                }
            ]
            orders_json = list(coll.aggregate(pipeline))

        return Order.many_from_json(orders_json)

    @staticmethod
    def insert_one(order):
        '''
        Inserts an Order object into the database
        '''
        json_obj = Order.to_json_db(order)
        if json_obj != None:
            db = MongoWrapper().client['vinyl_store']
            coll = db['orders']
            try:
                inserted = coll.insert_one(json_obj)
                return inserted.inserted_id
            except:
                return None

    @classmethod
    def find_order_by_attribute(cls, attribute, order_attribute):
        '''
        Finds a user by a specific attribute
        Returns user object
        '''
        db = MongoWrapper().client['vinyl_store']
        coll = db['orders']
        order_json = coll.find_one({ attribute: order_attribute })

        if order_json:
            order = Order.from_json(order_json)
            return order
        return None

    @classmethod
    def find_orders_by_attribute(cls, attribute, order_attribute):
        '''
        Finds a user by a specific attribute
        Returns user object
        '''
        db = MongoWrapper().client['vinyl_store']
        coll = db['orders']
        orders_json = list(coll.find({ attribute: order_attribute }))

        if orders_json:
            return Order.many_from_json(orders_json)
        return None

    @classmethod
    def update_order_attribute(cls, query_attribute, query_order_attribute, attribute, order_attribute):
        '''
        Queries for order by query_attribute = query_order_attribute
        Updates attribute of order to user_attribute
        '''
        query = { query_attribute: query_order_attribute }
        values = { "$set": { attribute: order_attribute } }
        db = MongoWrapper().client['vinyl_store']
        coll = db['orders']
        coll.update_one(query, values)

    def is_fulfilled(self):
        '''
        Determines if order is fulfilled
        Returns True if fulfilled, False otherwise
        '''
        return self.fulfilled

    @classmethod
    def find_order_by_user_product(cls, user_id, product_id):
        '''
        Find the most recent order by a user containing a product
        Return Order object
        '''
        db = MongoWrapper().client['vinyl_store']
        coll = db['orders']
        filter = {
            'user_id': ObjectId(user_id),
            'order.product_id': ObjectId(product_id)
        }
        orders_json = list(coll.find(filter).sort("date", 1))
        orders = Order.many_from_json(orders_json)
        if len(orders) > 0:
            return orders[0]
        else:
            return None
