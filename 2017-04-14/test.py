#!/usr/bin/python 

# Test to (un)set pin 12 and 13 on the Arduino Yun.
# H.Zimmerman, 09-12-2014.
# henszimmerman@gmail.com
 
import sys
sys.path.insert(0, '/usr/lib/python2.7/bridge')
 
from time import sleep
 
from bridgeclient import BridgeClient as bridgeclient
value = bridgeclient()
 
while (1):
	try:
		a1=value.get('Analog_0')
	except:
		a1=0
	print a1
	sys.stdout.flush()
	sleep(3)
