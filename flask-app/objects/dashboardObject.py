from objects.MongoWrapper import MongoWrapper
from datetime import datetime, timedelta
from bson.objectid import ObjectId
import math

class Dashboard:
    '''
    Dashboard class that contains methods for producing graphs for dashboard in the admin panel page
    '''
    @staticmethod
    def new_customers_graph(range_period = "day"):
        '''
        Creates object in the recharts format for a cumulative count of new customers over time.
        Everytime a new customer orders something, it will be tracked here.
        '''
        db = MongoWrapper().client['vinyl_store']
        orders_coll = db['orders']
        products_coll = db['products']

        date_format = ""
        date_list = None
        first_order = orders_coll.find().sort("date",1).next()
        if first_order == None:
            return []
        last_order = orders_coll.find().sort("date",-1).next()
        start_time = first_order['date']
        end_time = last_order['date']
        if (range_period == "day"):
            date_format = "%d/%m/%y"
            date_list = [(end_time - timedelta(days=x)).strftime(date_format) for x in range((end_time - start_time).days)]

        elif (range_period == "hour"):
            date_format = "%d/%m/%y %I %p"
            date_list = [(end_time - timedelta(hours=x)).strftime(date_format) for x in range(math.ceil(int((end_time - start_time).total_seconds())/3600))]

        elif (range_period == "month"):
            date_format = "%m/%y"
            date_list = [(end_time - timedelta(days=x)).strftime(date_format) for x in range((end_time - start_time).days * 30)]
            date_list = list(set(date_list))
        else:
            date_format = "%d/%m/%y"
            date_list = [(end_time - timedelta(days=x)).strftime(date_format) for x in range((end_time - start_time).days)]

        new_customers_dict = {}

        for date in date_list:
            new_customers_dict[date] = 0

        order_dict = {}
        for order in orders_coll.find().sort("date", 1):
            if str(order['user_id']) not in order_dict:
                order_dict[str(order['user_id'])] = order['date']
                order_date_formatted = order['date'].strftime(date_format)
                if order_date_formatted not in new_customers_dict:
                    new_customers_dict[order_date_formatted] = 0
                    date_list.append(order_date_formatted)
                new_customers_dict[order_date_formatted] +=1
    
        date_list.sort(key=lambda x: datetime.strptime(x, date_format))

        accumulative_customers = 0
        for date in date_list:
            accumulative_customers += new_customers_dict[date]
            new_customers_dict[date] = accumulative_customers

        chart_data = []
        for date in date_list:
            chart_data.append({
                'name':date,
                'new_customers':new_customers_dict[date]
        })
        return chart_data

    @staticmethod
    def revenue_graph(range_period = "day"):
        '''
        Creates object in the recharts format for revenue over time.
        '''

        db = MongoWrapper().client['vinyl_store']
        orders_coll = db['orders']
        products_coll = db['products']

        date_format = ""
        date_list = None
        first_order = orders_coll.find().sort("date",1).next()
        if first_order == None:
            return []
        last_order = orders_coll.find().sort("date",-1).next()
        start_time = first_order['date']
        end_time = last_order['date']
        if (range_period == "day"):
            date_format = "%d/%m/%y"
            date_list = [(end_time - timedelta(days=x)).strftime(date_format) for x in range((end_time - start_time).days)]

        elif (range_period == "hour"):
            date_format = "%d/%m/%y %I %p"
            date_list = [(end_time - timedelta(hours=x)).strftime(date_format) for x in range(int((end_time - start_time).total_seconds())//3600)]

        elif (range_period == "month"):
            date_format = "%m/%y"
            date_list = [(end_time - timedelta(days=x)).strftime(date_format) for x in range((end_time - start_time).days * 30)]
            date_list = list(set(date_list))

        else:
            date_format = "%d/%m/%y"
            date_list = [(end_time - timedelta(days=x)).strftime(date_format) for x in range((end_time - start_time).days)]

        revenue_dict = {}

        for date in date_list:
            revenue_dict[date] = 0

        order_dict = {}
        product_dict = {}
        for order in orders_coll.find():
            order_id = str(order['_id'])
            order_dict[order_id] = {
                'date' : order['date'],
                'products' : {}
            }
            for product_order in order['order']:
                product_id = str(product_order['product_id'])
                if product_id not in product_dict:
                    product_dict[product_id] = []
                product_dict[product_id].append(order_id)
                order_dict[order_id]['products'][product_id] = product_order['quantity']
        
        product_ids = []
        for product_id in product_dict.keys():
            product_ids.append(ObjectId(product_id))

        for product in products_coll.find(
            {
                "_id" : {"$in": product_ids}
            }
            ):
            for order_id in product_dict[str(product['_id'])]:
                order_date_formatted = order_dict[order_id]['date'].strftime(date_format)
                if order_date_formatted not in revenue_dict:
                    revenue_dict[order_date_formatted] = 0
                    date_list.append(order_date_formatted)
                quantity = order_dict[order_id]['products'][str(product['_id'])]
                revenue_dict[order_date_formatted] += (quantity * product['price'])

        date_list.sort(key=lambda x: datetime.strptime(x, date_format))
        chart_data = []
        for date in date_list:
            chart_data.append({
                'name':date,
                'revenue':revenue_dict[date]
        })

        return chart_data
        
