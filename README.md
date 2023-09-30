# MVP Vinyls

MVP Vinyls is an e-commerce web application using ReactJS, Flask, and MongoDB that allows users to buy and sell music records, receive record recommendations based on past preferences, and ask a simple chatbot common questions. For an in-depth discussion of the project, including the system overview, objectives and functionalities, third-party functionalities, implementation challenges, and user documentation/manual, refer to `COMP3900 Final Report`. 

## Problem

Anyone who has ever purchased vinyl records online has struggled finding new records they actually want to buy. There are two main causes of this: e-commerce vinyl record websites hinder the user’s ability to easily browse records and offer ill-suited record recommendations. E-Commerce companies selling vinyl records rarely specialise in selling vinyl records; moreover, this lack of specialisation leads to difficult record browsing and ill-suited record recommendations. When entering Amazon, the largest retailer of new vinyl in the world, users are not shown recommendations for vinyl records to purchase, but for new Prime Video shows to watch, ceramic bowls to buy, and foot cream. In order to search for a vinyl record, the user must type in a keyword, select ‘CDs & Vinyl’ under a long dropdown list, press search, where they are then directed to search results filled with CD’s and Cassettes and hopefully vinyl records. There is no browsing vinyl records on Amazon. 

E-Commerce companies that do focus on selling vinyl records allow users to browse vinyl records to purchase, but offer ill-suited record recommendations. When searching ‘David Bowie & Morrissey - Cosmic Dancer’ on Discogs, the largest retailer of used vinyl records in the world, the user is only shown recommendations of other David Bowie records or other Morrissey records. Amazingly, the user is shown recommendations for three different versions of Cosmic Dancer, the record they just searched for. Clearly, these recommendations do not allow users to discover the new records they desire.

## Solution

MVP Vinyls is an e-commerce vinyl record company that empowers users to find records they actually want by solving these browsing and recommendation issues in the existing marketplace. 
Users can login to their accounts; browse for vinyl records to purchase; receive record recommendations based on a specific vinyl record, based on their order history, and based on their Spotify listening history; get any questions answered by a chatbot; and of course, purchase the records themselves. Notably, these recommendations leverage the wealth of digital music data through the Spotify API in order to refine product recommendations for each user. As more music is listened to through streaming services than any other individual source, MVP Vinyls’ recommendation system is unparalleled in the existing marketplace (RIAA, 2018). Lastly, administrators can login to their accounts where they can manage inventory and view business insights from sales data, giving them all the tools necessary to maximise profits for MVP Vinyls.


## Installation and Dependencies
Download the source code from the [master branch](https://github.com/unsw-cse-comp3900-9900-21T1/capstone-project-3900-w11b-the-real-mvps/tree/master).

This system requires Python 3.8 and Node.js 12.x or higher to run. 

You can compile run this system in on a Linux server with the `build` script.
```sh
$ ./build
```

Alternatively, you can manually install dependencies and run the component applications.

The backend Flask application can be found in the `flask-app` directory. Navigate into this directory, then set up and run the application as follows:
```sh
$ python3 -m virtualenv venv
$ source venv/bin/activate
$ pip3 install -r requirements.txt
$ python3 server.py
```

The frontend React application can be found in the `react-app` directory. Navigate into this directory, then set up and run the application as follows:
```sh
$ yarn install
$ yarn start
```

Note that the manual set up commands must be run from the respective directories of the frontend and backend applications.


## Configuration
Configuration options for this system should be placed in a `credentials.json` file inside the `flask-app/credentials/` directory. This JSON file should contain the following fields:
* `username` is the username of the MongoDB database account
* `password` is the password of the MongoDb database account
* `connection_string` is the MongoDB URI connection string used to connect to the database
* `discogs_user_token` is the Discogs API token used to pull mock data for the database from Discogs
* `spotify_client_id` is the application client ID required to use the Spotify Web API
* `spotify_client_secret` is the key used for secure API calls to Spotify
* `spotify_client_redirect` is address whitelisted with Spotify so that the app can be relaunched when the user logs in
* `spotify_client_cache` is the location of the cached Spotify oauth token
* `stripe_api_publishable_key` is the public Stripe API key used as an identifier for the Stripe account used
* `stripe_api_secret_key` is the secret Stripe API key used for API requests
* `mail_server` is the SMTP server used to send emails to users
* `mail_port` is the port of the SMTP server
* `mail_username` is the username (email address) of the email account used to send emails
* `mail_password` is the password of the email account


## Documentation
The backend Flask application is designed to be a RESTful API for the frontend React application to use. The API documentation is available as `endpoint-documentation.yml` which is written for Swagger.


## Contributors
MVP Vinyls is proudly brought to you by **The Real MVPs**:

* Angela Yao (z5115096)
* Angus Feng (z5207356)
* Benjamin Pick (z5162064)
* Mandy Tao (z5060806)
* Michael Gysel (z5251938)

