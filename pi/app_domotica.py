import firebase_admin
from firebase_admin import credentials
from firebase_admin import db as database
from sense_hat import SenseHat
from time import time, sleep
import sys
import os


serviceAccountKey = '../../../../keys/serviceAccountKey.json'
databaseURL = 'https://wot-1819-85183.firebaseio.com'
TEMP_CORRECTION_FACTOR = 1.5
firebase_ref_domotica = ''

try:
    # Fetch the service account key JSON file contents
    firebase_cred = credentials.Certificate(serviceAccountKey)
    # Initalize the app with a service account; granting admin privileges
    firebase_admin.initialize_app(firebase_cred, {
    'databaseURL': databaseURL
    })
    # As an admin, the app has access to read and write all data
    firebase_ref_domotica = database.reference('domotica/cf79X52JsAgOlXhA1TBktq0GA7T2')
    print('Firebase initialized!')
except:
    print('Unable to initialize Firebase: {}'.format(sys.exc_info()[0]))
    sys.exit(1)

# get the CPU temperature
def get_cpu_temp():
    res = os.popen('vcgencmd measure_temp').readline()
    t = float(res.replace('temp=', '').replace("'C\n", ''))
    return(t)

# use moving average to smooth readings
def get_smooth(x):
  if not hasattr(get_smooth, "t"):
    get_smooth.t = [x,x,x]
  get_smooth.t[2] = get_smooth.t[1]
  get_smooth.t[1] = get_smooth.t[0]
  get_smooth.t[0] = x
  xs = (get_smooth.t[0]+get_smooth.t[1]+get_smooth.t[2])/3
  return(xs)

# get the real temperature
def get_temp(with_case):
    temp_humidity = sense_hat.get_temperature_from_humidity()
    temp_pressure = sense_hat.get_temperature_from_pressure()
    temp = (temp_humidity + temp_pressure)/2
    if with_case:
        temp_cpu = get_cpu_temp()
        temp_corrected = temp - ((temp_cpu - temp)/TEMP_CORRECTION_FACTOR)
        temp_smooth = get_smooth(temp_corrected)
    else:
        temp_smooth = get_smooth(temp)
    return(temp_smooth)

def fetch_pattern(): 
    domotica = firebase_ref_domotica.child('pattern').get()
    sense_hat.set_pixels(domotica)

def set_temp_hum(temp,hum):
    firebase_ref_domotica.child('temp').set(temp)
    firebase_ref_domotica.child('hum').set(hum)

def main():
    while True:
        set_temp_hum(round(get_temp(True)),round(sense_hat.get_humidity()))
        fetch_pattern()
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
        