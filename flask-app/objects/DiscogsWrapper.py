import json
import discogs_client
class CredentialsError(Exception):
    def __init__(self, message):
        self.message = message

class DiscogsWrapper:
    '''
    Wrapper class for ensuring one instance of discogs_client client, as per the Borg pattern.
    Credentials file is checked for valid properties.
    '''
    __shared_state = {}
    def __init__(self):
        self.__dict__ = self.__shared_state
        try:
            with open('credentials/credentials.json', 'r') as creds_file:
                credentials = json.load(creds_file)
            if "discogs_user_token" not in credentials:
                raise CredentialsError("Credentials file not valid")
            else:
                # Can't catch exception for wrong credentials here            
                self.client = discogs_client.Client('VinylStoreApplication/0.1',user_token=credentials['discogs_user_token'])
        except:
            raise CredentialsError("Credentials file not valid")