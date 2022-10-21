import json
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from spotipy.oauth2 import SpotifyOAuth

class CredentialsError(Exception):
    def __init__(self, message):
        self.message = message

class SpotifyWrapper:
    '''
    Wrapper class for ensuring one instance of SpotifyOAuth client, as per the Borg pattern.
    Credentials file is checked for valid properties.
    '''
    __shared_state = {}
    def __init__(self):
        self.__dict__ = self.__shared_state
        self.user_client = None
        try:
            with open('credentials/credentials.json', 'r') as creds_file:
                credentials = json.load(creds_file)
            if "spotify_client_id" not in credentials or "spotify_client_secret" not in credentials or "spotify_client_redirect" not in credentials or "spotify_client_cache" not in credentials: 
                raise CredentialsError("Credentials file not valid")
            else:
                # Can't catch exception for wrong credentials here            
                self.client = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=credentials['spotify_client_id'],
                                                           client_secret=credentials['spotify_client_secret']))
                scope = "user-top-read"
                self.oauth_manager = SpotifyOAuth(credentials['spotify_client_id'],credentials['spotify_client_secret'], credentials['spotify_client_redirect'], scope = scope, cache_path = credentials['spotify_client_cache'])
        except Exception as e:
            raise CredentialsError("Credentials file not valid")
    def get_oauth(self, request):
        '''
        Attempts to retrieve the Spotify OAuth token from the URL, and Python cache.
        If the token is expired or cannot be found, a new authorization url is returned.
        '''
        try:
            access_token = ""            
            token_info = self.oauth_manager.get_cached_token()
            if token_info:
                access_token = token_info['access_token']
            else:
                code = self.oauth_manager.parse_response_code(request.url)
                if code != request.url:
                    try:
                        token_info = self.oauth_manager.get_access_token(code)
                    except:
                        return {
                            'status':'request', 
                            'url' : self.oauth_manager.get_authorize_url()
                        } 

                    access_token = token_info['access_token']
            if access_token:
                user_client = spotipy.Spotify(access_token)
                return {
                    'status':'success',
                    'client' : user_client
                }    
            else:
                return {
                    'status':'request', 
                    'url' : self.oauth_manager.get_authorize_url()
                } 
        
        except Exception as e:
            raise e
    def save_oauth(self, request):
        '''
        Saves the OAuth token in the Python cache.
        '''
        access_token = ""
        code = self.oauth_manager.parse_response_code(request.url)
        if code != request.url:
            token_info = ""
            try:
                token_info = self.oauth_manager.get_access_token(code)
            except:
                return False
            access_token = token_info['access_token']
            if access_token:
                return True
        else:
            return False