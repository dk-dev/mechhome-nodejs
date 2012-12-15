# MechHome for node.js

## Description

This project provides a framework for DIY home automation and security monitoring.

## Install

npm install mechhome

## Configure

MechHome currently relies on a Redis backend, meaning you must first [install Redis](http://redis.io/).

config/mechhome.properties supplies parameters for the application and all plugins.

The application won't do a whole lot without plugins defined:
mechhome.plugins = plugin name 1,...,plugin name N

## Run

node mechhome.js

### web_interface

Provides a real-time frontend for MechHome using sockets. There are currently a couple of things hard-coded that you'll want to change:
* plugins/web_interface/www/client.js - the host and port for socket connection
* plugins/web_interface/www/index.html - the floorplan image used on the dashboard, unless we have the same house :P

Styling needs a lot of work - many thanks to anyone who can help.

### loggly_logger

Sends logs and changed zones to Loggly. Make sure to provide login/input parameters in mechhome.properties.

### winston_logger

Logs through Winston (part of Flatiron.js). Haven't done much with this - it's not much different from console logging at the moment.

### arduino_device

Provides node information via a USB serial interface. My implementation is connected to a siren/strobe, window, door, and motion sensors. More to come on that later (or bug me via email if you're dying for it).

### proxy

Unfinished, but in theory allows instances of MechHome to forward events to other instances. This would allow, for example, two machines in different rooms to be hooked up to Arduino devices and report through the same interface, or provide failover.

### demo

Unfinished, but in theory allows for injecting events for the purpose of testing other plugins.

## Extend

### Plugins

Plugins are extensions of MechHome that perform a wide variety of functions, and are implemented by creating a plugins/plugin_name/index.js file with the following at a minimum:

	function init(appHandle) {
	    appHandle.register('plugin name', function(type, obj) {
	        // Handle application events here
	    });
	exports.init = init;

The appHandle currently provides access to the following:
* register('plugin name', callback) - This allows the plugin to receive event data
* log('type', object) - Messaging to other plugins (rename might be in order)
* config['key'] - Access to properties file
* setZone(oldZone, newZone) - Modify a zone (see database.js:initialize() for example definition)

See some of the existing plugins for more examples.

### Node types

The node type is an emerging concept for defining the inputs and outputs of MechHome.  Doors, windows, motion sensors, and relays can all be represented with their own icons, messaging, etc. but should still be implemented consistently for easy extension of the application.  I've created shells for some basic types, but am still working to define the concept (see TODO's), and they are not currently used for anything.  Feedback welcome.

## TODO's

This project is in early development, and any feedback/changes are appreciated.

### Core

* Evolve the concept of node types (i.e. what kind of different behaviors can be captured for each?)
* Create node types for system alerts, lighting, X11, etc.  Should existing plugins, like arduino_device, be converted to node types?
* Improve the way nodes are defined (i.e. not hard-coded in database.js:initialize())
* Refactor 'zone' to 'node'
* Create init/upstart scripts
* Make some feature suggestions
* Write some tests!

### Plugins

* Implement proxy plugin to allow MechHome processes on other machines to forward device data, etc.
* Add implementation details (and Arduino code) for the arduino_device plugin (dcrouse)
* Create non-persistent 'database' plugin alternative to the current Redis-backed database.js.
* Finish demo plugin.  Maybe each node type and/or plugin should provide a demo method, called by this plugin?

### web_interface plugin

I'm calling this out separately because it needs a lot of love, and it's a major component of MechHome - I'm not a frontend developer and it shows.  The basic idea is that you can define an image (e.g. floorplan, dashboard) that will be overlayed with different icons for each node, depending on type, state, and possibly more.  The main thing I've accomplished with the interface at this point is real-time update.

* Make web_interface socket host/port dynamic
* Help create integration with the work-in-progress node types
* Tabs for multiple floors/floorplan vs. dashboard/etc.
* Mobile-friendly version for remote monitoring
* Improve node configuration workflow/UI

## License

(The MIT License)

Copyright (c) 2012 Devon Crouse &lt;devoncrouse@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
