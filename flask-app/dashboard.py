from flask import Flask, request, redirect, url_for, make_response, jsonify

from objects.dashboardObject import Dashboard
from objects.userObject import User

def revenue_dashboard(current_user, args):
    '''
    Returns revenue dashboard data in Recharts format.
    Everytime a sale is made, it is tracked here.
    '''
    if not current_user.is_admin():
        return { "message": "The current user is not an administrator." }, 401
    chart_data = None
    if 'scope' in args:
        chart_data = Dashboard.revenue_graph(args['scope'])
    else:
        chart_data = Dashboard.revenue_graph()
    return { "data": chart_data, "message": "Success."}, 200

def customers_dashboard(current_user, args):
    '''
    Returns new customers orders data in Recharts format.
    Everytime a new customer orders something, it will be tracked here.
    '''
    if not current_user.is_admin():
        return { "message": "The current user is not an administrator." }, 401
    chart_data = None
    if 'scope' in args:
        chart_data = Dashboard.new_customers_graph(args['scope'])
    else:
        chart_data = Dashboard.new_customers_graph()
    return { "data": chart_data, "message": "Success."}, 200

