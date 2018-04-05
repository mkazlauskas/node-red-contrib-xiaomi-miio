const miio = require('miio');
// const util = require('util');

var allDevices = {
    instance: Math.random()
};

var optionDevices = [];

var propertyCallbacks = {};
var actionCallbacks = {};
var motionCallbacks = {};


const devices = miio.devices({
	cacheTime: 300 // 5 minutes. Default is 1800 seconds (30 minutes)
});

/* ======================================================================================================= */
devices.on('available', reg => {

	const device = reg.device;
	if(!device) {
		console.log(reg.id, 'could not be connected to');
		return;
	}
	const id = device.id;
	const model = device.miioModel;
	console.log(`Detected device with '${model}' identifier '${id}'`);
	if (device.matches('type:miio:gateway')) {
		handleGateway(id, device);
	}
	if (device.matches('cap:actions')) {
		handleController(id, device);
	}
	if (device.matches('cap:motion')) {
		handleMotion(id, device);
	}
	
	if (typeof allDevices[id] === 'undefined') {
		optionDevices.push({id, model});
		allDevices[id] = device;
	} else {
		console.log('Device already initialized.');
	}

});

/* ======================================================================================================= */
function triggerCallback(id, deviceCallbacks, event, device) {
	var callbacks = deviceCallbacks[id];
	// console.log('triggerCallback', id, callbacks.length, event, device);
	
	if (callbacks) {
		for (var i = 0, len = callbacks.length; i < len; i++) {
			var callback = callbacks[i];
			if (typeof callback === "function") {
			    event = (typeof event === 'undefined') ? {} : event;
			    event.device = device;
				callback(event);
			}
		}
	}

}

/* ======================================================================================================= */
function handleGateway(id, device) {

    // Handlers for Gateway events
    device.on('propertyChanged', e => {
        triggerCallback(id, propertyCallbacks, e, device);
    });

    device.on('action', e => {
		triggerCallback(id, actionCallbacks, e, device);
    });

}


/* ======================================================================================================= */
function handleController(id, device) {

    device.on('propertyChanged', e => {
        console.log('Controller', id, 'propertyChanged', e);
        triggerCallback(id, propertyCallbacks, e, device);
    });

    device.on('action', e => {
        console.log('Controller', id, 'action', e);
	triggerCallback(id, actionCallbacks, e, device);
    });

}

/* ======================================================================================================= */
function handleMagnet(id, device) {

    device.on('propertyChanged', e => {
		triggerCallback(id, propertyCallbacks, e, device);
    });

    device.on('action', e => {
		triggerCallback(id, actionCallbacks, e, device);
    });

}

/* ======================================================================================================= */
function handleSensor(id, device) {

    device.on('propertyChanged', e => {
		triggerCallback(id, propertyCallbacks, e, device);
    });

    device.on('action', e => {
		triggerCallback(id, actionCallbacks, e, device);
    });

}

/* ======================================================================================================= */
function handleAirPurifier(id, device) {

    device.on('propertyChanged', e => {
		triggerCallback(id, propertyCallbacks, e, device);
    });

    device.on('action', e => {
		triggerCallback(id, actionCallbacks, e, device);
    });

}

/* ======================================================================================================= */
function handleMotion(id, device) {
	console.log('handleMotion', id, device);

    device.on('propertyChanged', e => {
	    console.log('motion propertyChanged', e);
		triggerCallback(id, propertyCallbacks, e, device);
    });

    device.on('action', e => {
	    console.log('motion action', e);
		triggerCallback(id, actionCallbacks, e, device);
    });

    // device.on('motion', e => {
// 	    console.log('motion motion', e);
// 		triggerCallback(id, motionCallbacks, e, device);
  //   });
    
    device.on('stateChanged', e => {
	if (e.key === 'motion') {
		triggerCallback(id, motionCallbacks, {motion: e.value}, device);
	}
    });

}

/* ======================================================================================================= */
function addCallbacks(deviceId, deviceCallbacks, callback) {
	if (!deviceCallbacks[deviceId]) {
		deviceCallbacks[deviceId] = [];
	}

	deviceCallbacks[deviceId].push(callback);	
}

/* ======================================================================================================= */
module.exports = {
	devices: allDevices,
	optionDevices: optionDevices,
    registerPropertyListener: function(deviceId, callback) {
    	addCallbacks(deviceId, propertyCallbacks, callback);
    },
    registerActionListener: function(deviceId, callback) {
    	addCallbacks(deviceId, actionCallbacks, callback);
    },
    registerMotionListener: function(deviceId, callback) {
    	addCallbacks(deviceId, motionCallbacks, callback);
    }
}


