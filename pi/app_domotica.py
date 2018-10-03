import firebase_admin
from firebase_admin import credentials
from firebase_admin import db as database
from sense_hat import SenseHat
from time import time, sleep
import sys

# constants
e =  (0,0,0)
dy = (255,255,0)
ly = (128,128,0)
db = (0,0,255)
lb = (0,0,128)
dg = (0,255,0)
lg = (0,128,0)
dr = (255,0,0)
lr = (128,0,0)

serviceAccountKey = '../../../../keys/serviceAccountKey.json'
databaseURL = 'https://wot-1819-85183.firebaseio.com'
#firebase_ref_new = ''

try:
    # Fetch the service account key JSON file contents
    firebase_cred = credentials.Certificate(serviceAccountKey)
    # Initalize the app with a service account; granting admin privileges
    firebase_admin.initialize_app(firebase_cred, {
    'databaseURL': databaseURL
    })
    # As an admin, the app has access to read and write all data
    #firebase_ref_new = database.reference('new')
    print('Firebase initialized!')
except:
    print('Unable to initialize Firebase: {}'.format(sys.exc_info()[0]))
    sys.exit(1)



def main():
    firebase_ref_domotica = database.reference('domotica/cf79X52JsAgOlXhA1TBktq0GA7T2')
    while True:
        domotica = firebase_ref_domotica.get()
        colors = []
        for doms in domotica:
            colors.append(eval(doms))
        sense_hat.set_pixels(colors)
        sleep(1)
    

try:
    # SenseHat
    sense_hat = SenseHat()
    sense_hat.set_imu_config(False, False, False)
except:
    print('Unable to initialize the Sense Hat library: {}'.format(sys.exc_info()[0]))
    sys.exit(1)

        
if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, SystemExit):
        print('Interrupt received! Stopping the application...')
    finally:
        print('Cleaning up the mess...')
        sense_hat.clear()
        sys.exit(0)
        