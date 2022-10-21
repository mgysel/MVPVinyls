from __future__ import annotations
from objects.MongoWrapper import MongoWrapper
from objects.SpotifyWrapper import SpotifyWrapper
from objects.DiscogsWrapper import DiscogsWrapper
from bson.son import SON
from bson.objectid import ObjectId
from random import randint
import json
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pprint

class Product:
    '''
    Product class that contains basic product info/methods
    '''

    SORT_DEF = {
        'ascending': 1,
        'descending': -1
    }
    ORDER_DEF = {
        'alphabetical': 'album.name',
        'price': 'price'
    }
    QTYPE_DEF = {
        'album': 'album.name',
        'artist': 'artists.name',
        'song': 'songs.name'
    }
    PAGE_SIZE = 12

    def __init__(self,_id, artists, album, stock,price,genres, images, songs):
        self._id = _id
        self.artists = artists
        self.album = album
        self.stock = int(stock)
        self.price = float(price)
        self.genres = genres
        self.images = images
        self.songs = songs

    @staticmethod
    def get_all_products(criteria={})->list[Product]:
        '''
        Gets all available products.
        '''

        db = MongoWrapper().client['vinyl_store']
        coll = db['products']
        products = []
        for product_json in coll.find(criteria):
            product = Product.from_json(product_json)
            products.append(product)
        return products

    @staticmethod
    def get_product(criteria={})->Product:
        '''
        Gets a specific product according to MongoDB JSON criteria.
        '''
        db = MongoWrapper().client['vinyl_store']
        coll = db['products']
        product_json = coll.find_one(criteria)
        if product_json:
            product = Product.from_json(product_json)  
            return product
        return None

    @staticmethod
    def get_products_from_search(query,qtype,page,sort,order_by,genres)->list[Product]:
        '''
        Searches for a set of products by the query given, which products to sort,
        for which page for pagnation on the frontend, the which field to search for,
        and the genres that the query should be filtered to.
        '''
        filter = Product._make_filter(qtype, query, genres)
        skip = (int(page)-1)*Product.PAGE_SIZE
        limit = Product.PAGE_SIZE
        field = Product.ORDER_DEF[order_by]
        direction = Product.SORT_DEF[sort]

        db = MongoWrapper().client['vinyl_store']
        coll = db['products']
        results = coll.find(filter=filter,skip=skip,limit=limit).collation({'locale':'en'}).sort(field, direction)
        return [Product.from_json(x) for x in results]

    @staticmethod
    def get_top_genres_from_search(query,qtype,limit,genres)->list[str]:
        '''
        Retrieves most popular genres, by their count across all products, according to a specified limit.
        '''

        filter = Product._make_filter(qtype, query, genres)
        pipeline = [
            {'$match': filter},
            {'$unwind': '$genres'},
            {'$group': {'_id': '$genres', 'count': {'$sum': 1}}},
            {'$sort': SON([('count', -1), ('_id', 1)])},
            {'$limit': limit}
        ]
        db = MongoWrapper().client['vinyl_store']
        coll = db['products']
        return [x.get('_id') for x in coll.aggregate(pipeline)]

    @staticmethod
    def get_num_search_results(query: str, qtype: str, genres: str)->int:
        '''
        Helper function to return a count of a search query.
        '''

        filter = Product._make_filter(qtype, query, genres)
        db = MongoWrapper().client['vinyl_store']
        coll = db['products']
        return coll.count_documents(filter)
    
    @staticmethod
    def many_to_json(products: list[Product]):
        '''
        Converts a list of Products to a list of python inbuilt object.
        '''
        l = []
        for product in products:
            l.append(product.to_json())
        return l

    @staticmethod
    def many_to_json_str(products: list[Product]):
        '''
        Converts a list of Products to a list of strings.
        '''
        l = []
        for product in products:
            l.append(product.to_json_str())
        return l    

    def to_json_str(self):
        '''
        Converts one Product to a string.
        '''
        obj = self.__dict__
        if obj['_id'] == None:
            del obj['_id']
        else:
            obj['_id'] = str(obj['_id'])
        return obj

    def to_json(self):
        '''
        Converts one Product to a python inbuilt object.
        '''
        obj = self.__dict__
        if obj['_id'] == None:
            del obj['_id']
        return obj

    @staticmethod
    def from_json(product_json)->Product:
        '''
        Converts a python inbuilt object for a existing product (i.e. has an id) to a
        Product object.
        '''
        properties = ['artists', 'album', 'stock', 'price', 'genres', 'images', 'songs']
        for prop in properties:
            if prop not in product_json:
                return None
        _id = None
        if '_id' in product_json:
            _id = product_json['_id']
        return Product(_id,product_json['artists'],product_json['album'], product_json['stock'], product_json['price'],product_json['genres'],product_json['images'],product_json['songs'])
    
    @staticmethod
    def from_json_new_product(product_json)->Product:
        '''
        Converts a python inbuilt object for a new product (i.e. has not been assigned an id yet) to a
        Product object.
        Images are assumed to be base64 encoded as passed from frontend
        '''
        if not product_json:
            return None
        properties = ['artists', 'album', 'stock', 'price', 'genres', 'images', 'songs']
        for prop in properties:
            if prop not in product_json:
                return None
        if '_id' in product_json:
            return None
        if isinstance(product_json['images'], str) and isinstance(product_json['songs'], list):
            images_obj = [
                {
                    'base64':product_json['images']
                }
            ]
            songs_obj = []
            for song_name in product_json['songs']:
                songs_obj.append({
                    'name': song_name,
                    'length':-1
                })
            price = 0
            stock = 0
            try:
                price = float(product_json['price'])
                stock = int(product_json['stock'])
            except:
                return None
            return Product(None,product_json['artists'],product_json['album'], stock,price,product_json['genres'],images_obj,songs_obj)
        return None

    @staticmethod
    def get_new_discogs_products(amount):
        '''
        Returns a list of Products as per a specified amount which are
        generated using the most recent Discogs products. Stock and price are randomised here.
        '''
        d = DiscogsWrapper().client
        results = d.search(type="release")
        count = 0
        to_insert = []
        product_list = []
        for i in results:
            count +=1
            master = i.master
            album = {
                'name':master.title
            }
            songs = []
            for track in master.tracklist:
                duration = track.duration.split(':')
                try:
                    length = int(duration[0]) * 60 + int(duration[1])
                    songs.append({
                        'length': length,
                        'name' : track.title
                    })
                except ValueError as e:
                    songs.append({
                        'length': -1,
                        'name' : track.title
                    })

            artists = []
            for artist in i.artists:
                artists.append({
                    'name':artist.name
                })
            images = []
            for image in master.images:
                images.append({
                    'width':image['width'],
                    'height':image['height'],
                    'url':image['uri']
                })
                break
            stock = randint(0,100)
            price = randint(0,100)
            product_list.append(Product(None, artists, album, stock,price,['SPOTIFY'], images, songs))
            if count >=amount:
                break
        return product_list
    
    @staticmethod
    def insert_many(products: list[Product]) :
        '''
        Inserts a list of Products into MongoDB database.
        '''
        to_insert = []
        for product in products:
            to_insert.append(product.to_json())
        db = MongoWrapper().client['vinyl_store']
        coll = db['products']
        try:
            inserted = coll.insert_many(to_insert)
            return inserted.inserted_ids
        except:
            return None

    @staticmethod
    def insert_one(product: Product):
        '''
        Inserts a new Product into MongoDB database.
        '''
        json_obj = product.to_json()
        if json_obj != None:
            db = MongoWrapper().client['vinyl_store']
            coll = db['products']
            try:
                inserted = coll.insert_one(json_obj)
                return inserted.inserted_id
            except:
                return None

    @staticmethod
    def update_many(products: list[Product])->list[Product]:
        '''
        Updates all documents in MongoDB instance which have the id in the inputted list of Products
        according to its properties.
        '''
        db = MongoWrapper().client['vinyl_store']
        coll = db['products']
        for product in products:
            query = {
                "_id": {"$eq":product._id}
            }
            updated = {
                "$set": product.to_json()
            }
            coll.update_many(query, updated)

    @staticmethod
    def get_spotify_information(products : list[Product]) :
        '''
        Updates list of Products' genres in place as per Spotify API's most relevant
        search result.
        '''
        sp = SpotifyWrapper().client
        # Spotify allows for searching of genre by artist, so look in each artist and find genres and collaborate
        d = {}
        for product in products:
            genres = set()
            for artist in product.artists:
                genre_list = (sp.search(artist['name'], 1, 0, 'artist',None)['artists']['items'][0]['genres'])
                genres.update(genre_list)
            product.genres= list(genres)

    def get_recommendations(self, amount =5)-> list[Product]:
        '''
        Gets a list of recommendations for a certain Product as per specified amount.
        All products are one hot encoded to a vector form and then cosine similarity is applied.
        '''
        all_products = Product.get_all_products({"_id": { "$ne": self._id }})
        all_genres = set()
        indexes = []
        for product in all_products:
            indexes.append((product._id))
            all_genres.update(product.genres)
        all_genres = list(all_genres)
        def one_hot_encoding(all_genres, products):
            matrix = []
            for product in products:
                curr_list = []
                for genre in all_genres:
                    if genre in product.genres:
                        curr_list.append(1)
                    else:
                        curr_list.append(0)
                matrix.append(curr_list)
            return matrix
        matrix = one_hot_encoding(all_genres, all_products)
        to_compare = np.reshape(one_hot_encoding(all_genres, [self])[0], (1,-1))
        max_similarity = 0
        max_similarity_id = 0

        df = pd.DataFrame(data=matrix, columns = all_genres, index=indexes) 
        sim = cosine_similarity(to_compare, df)[0]
        sort_index = np.argsort(sim)
        recommendations = []
        count = 0
        for i in range(len(sort_index)-1, -1, -1):
            if count >= amount:
                break
            for product in all_products:
                if product._id == df.iloc[sort_index[i]].name:
                    recommendations.append(product)
            count +=1
        return recommendations

    @staticmethod
    def parse_recommendation_results(vector, all_genres, all_products, amount):
        '''
        Helper function for cleansing and applying cosine similarity to vector and all other products.
        '''

        to_compare = []
        for genre in all_genres:
            if genre not in vector:
                vector[genre] = 0
        for genre in all_genres:
            to_compare.append(vector[genre])
        to_compare = np.reshape(to_compare, (1,-1))
        def one_hot_encoding(all_genres, products):
            matrix = {}
            for product in products:
                product_vector = []
                for genre in all_genres:
                    if genre in product.genres:
                        product_vector.append(1)
                    else:
                        product_vector.append(0)
                matrix[str(product._id)] = product_vector
            return matrix
        matrix = one_hot_encoding(all_genres, all_products)
        df = pd.DataFrame.from_dict(matrix, orient='index', columns = all_genres)
        sim = cosine_similarity(to_compare, df)[0]
        sort_index = np.argsort(sim)
        recommendations = {
            "recommended" : [],
            "suggested" : []
        }
        count = 0
        recommended_product_ids = set()
        for i in range(len(sort_index)-1, -1, -1):
            if count >= amount:
                break
            for product in all_products:
                if str(product._id) == df.iloc[sort_index[i]].name and sim[sort_index[i]] > 0:
                    recommended_product_ids.add(product._id)
                    l = recommendations['recommended']
                    l.append(product)
                    break
            count +=1
        count = 0
        for i in range(0, len(sort_index), 1):
            if count >= amount:
                break
            for product in all_products:
                if str(product._id) == df.iloc[sort_index[i]].name and product._id not in recommended_product_ids:
                    l = recommendations['suggested']
                    l.append(product)
                    break
            count+=1
        return recommendations

    @staticmethod
    def get_recommendations_from_top_spotify(request, amount = 10) -> list[Product] :
        '''
        Handles OAuth flow with Spotify when a user token is not stored in the cache, and 
        returns a list of Products which have the most similar genres to the user's top artists.
        '''
        res = SpotifyWrapper().get_oauth(request)
        if (res['status'] == 'request'):
            return res
        else :
            sp_user = res['client']
            sp = SpotifyWrapper().client
            top_artists = sp_user.current_user_top_artists(limit=10)
            if not top_artists:
                return None
            all_products = Product.get_all_products()
            all_genres = set()
            for product in all_products:
                all_genres.update(product.genres)
            vector = {}
            to_compare = []
            for artist in top_artists['items']:
                artist_obj = sp.artist(artist['uri'])
                all_genres.update(artist_obj['genres'])
                for genre in artist_obj['genres']:
                    if genre not in vector:
                        vector[genre] = 1
                    else:
                        vector[genre] +=1

            recommendations = Product.parse_recommendation_results(vector, all_genres, all_products, amount)
            return {
                "status" : 'success', 
                "recommendations":recommendations
            }

    @staticmethod
    def get_recommendations_from_orders(request, current_user, amount = 10) -> list[Product] :
        '''
        Retrieves recommendations based on previous orders, weighting products with greater quanity
        ordered higher.
        '''

        db = MongoWrapper().client['vinyl_store']
        coll = db['orders']
        ordered_products = {}
        for order in coll.find({"user_id":ObjectId(current_user._id)}):
            for product in order['order']:
                ordered_products[str(product['product_id'])] = {
                    'quantity': product['quantity']
                }
        # Find all products which were ordered and ones which werent ordered
        # The more quantity of a product you ordered, should be weighted higher
        non_ordered_products = Product.get_all_products()
        i = 0
        all_genres = set()
        vector = {}
        to_compare = []
        while i < len(non_ordered_products):
            all_genres.update(non_ordered_products[i].genres)
            if str(non_ordered_products[i]._id) in ordered_products:
                for genre in non_ordered_products[i].genres:
                    if genre not in vector:
                        vector[genre] = (ordered_products[str(non_ordered_products[i]._id)]['quantity'])
                    else:
                        vector[genre] += (ordered_products[str(non_ordered_products[i]._id)]['quantity'])

                ordered_products[str(non_ordered_products[i]._id)]['product'] = non_ordered_products[i]
                del non_ordered_products[i]
            else:
                i+=1
        return Product.parse_recommendation_results(vector, all_genres, non_ordered_products, amount)

            
    @staticmethod
    def authenticate_spotify(request):
        '''
        Helper function for single Spotify authentication endpoint.
        '''
        if SpotifyWrapper().save_oauth(request):
            return True
        return False

    @staticmethod
    def _make_filter(qtype, query, genres):
        '''
        Helper function which inputs query type, being the MongoDB identifier for the property you wish to query,
        the query which is applied using regex, and the genres used in the query.
        '''

        if qtype:
            filter = {Product.QTYPE_DEF[qtype]: {'$regex': f".*{query}.*", '$options': 'i'}}
        else:
            filter = {
                '$or':
                    [
                        {'album.name': {'$regex': f".*{query}.*", '$options': 'i'}},
                        {'artists.name': {'$regex': f".*{query}.*", '$options': 'i'}},
                        {'songs.name': {'$regex': f".*{query}.*", '$options': 'i'}},
                    ]
            }
        if genres != ['']:
            query_list = [{'genres': {'$regex': f"^{x}$", '$options': 'i'}} for x in genres]
            query_list.append(filter)
            filter = {'$and': query_list}
        return filter

    def edit_product(self,payload)->Product:
        '''
        Inputs a JSON payload containing a list of Products and updates them according the JSON inputted.
        '''
        edited_product = Product.from_json_new_product(payload)
        if not edited_product:
            return None
        # Copy all properties from edited_product to new product
        edited_product._id = self._id
        Product.update_many([edited_product])
        return edited_product

    def delete_product(self):
        '''
        Deletes the current Product from the MongoDB instance.
        '''
        db = MongoWrapper().client['vinyl_store']
        coll = db['products']
        coll.delete_one({"_id": ObjectId(self._id)})


