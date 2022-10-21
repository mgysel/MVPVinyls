from werkzeug.security import generate_password_hash
from objects.MongoWrapper import MongoWrapper
from objects.User import User
from bson import ObjectId

# from MongoWrapper import MongoWrapper
# from userObject import User

class Admin(User):
    '''
    admin class that contains basic user info/methods and 
    additional admin info/methods
    '''
    def __init__(self, email, password, first_name, last_name):
        self.email = email
        self.password_hash = generate_password_hash(password)
        self.first_name = first_name
        self.last_name = last_name
        self.payment_methods = []
        self.shipping_address = []
        self.spotify_id = ""
        self.cart_id = {}
        self.role = "admin"
        self.reset_code = "-1"
        self.insert_user()

admin = Admin("firstadmin@gmail.com", "password", "first", "last")
admin.get_all_users()