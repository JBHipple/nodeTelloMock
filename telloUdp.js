var udp = require("dgram");

var server = udp.createSocket("udp4");

var port = 8889;

var serverState = {
    'commandOn': false,
    'currentlyFlying': false,
    'currentSpeed': 0,
    'battery': 100
};

server.on("listening", function(){
    var address = server.address();
    console.log("Listening to ", "Address: ", address.address, "Port: ", address.port);
});

server.on("message", function(message, info){
    var command = message.toString();

    console.log("Command received: " + message.toString());

    var commandState = validateCommand(command);

    var response
    if(commandState.valid){
        response = Buffer.from("OK");
    } else{
        response = Buffer.from("ERROR: " + commandState.message);
    }

    server.send(response, info.port, info.address, function(err){
        if(err){
            console.log("Sending response failed: ", err);
            client.close();
        } else{
            console.log("Response sent successfully.");
        }
    });
});

server.on("error",function(error){
    console.log("Error: " + error);
    server.close();
});

server.bind(port);

function validateCommand(command){
    // Define return object
    var retObject = {};

    // Define arrays of valid commands according to DJI Tello SDK 3.0
    var noParamCommands = ['command', 'takeoff', 'land', 'streamon', 'streamoff', 'emergency', 'motoron', 'motoroff',
                           'throwfly', 'stop', 'reboot', 'mon', 'moff'];
    var paramCommands = ['up', 'down', 'left', 'right', 'forward', 'back', 'cw', 'ccw', 'flip', 'go', 'curve', 'jump',
                         'speed', 'rc', 'wifi', 'mdirection', 'ap', 'wifisetchannel', 'port', 'setfps', 'setbitrate', 'setresolution', 'multiwifi'];
    var readCommands = ['speed?', 'battery?', 'time?', 'wifi?', 'sdk?', 'sn?', 'hardware?', 'wifiversion?', 'ap?', 
                        'ssid?'];
    
    // If the command is restartServer, reset the server params and return valid
    if(command == 'restartServer'){
        serverState = {
            'commandOn': false,
            'currentlyFlying': false,
            'currentSpeed': 0,
            'battery': 100
        };
        retObject.valid = true;
    }
    
    // If the passed in command contains a space, it is a command that contains a 
    // parameter and needs to be split into each component
    // Else, command is no-param and validation is simply checking against the list
    if(command.includes(' ')){
        // Split the command into its components
        var commandArr = command.split(' ');

        // Check if the command name matches one in the list of valid parameter commands
        // Else, check if the command is in the list of no-param commands and has a param by error
        // Else, check if the command is in the list of read commands and has a param by error
        if(paramCommands.includes(commandArr[0])){
            // TODO - Add logic to check against each command's required parameters
            validateParamResp = validateParameters(commandArr);

            retObject = validateParamResp;
        } else if(noParamCommands.includes(commandArr[0]) || readCommands.includes(commandArr[0])){
            // The command that was passed in contained a parameter and should not have one
            retObject.valid = false;
            retObject.message = 'Command ' + commandArr[0] + ' should not have a parameter.';
        }
    } else{
        if(noParamCommands.includes(command) || readCommands.includes(command)){
            retObject.valid = true;
        } else{
            // Set validity to false
            retObject.valid = false;

            // Determine reason for invalidity.  Either a param was required, or the command doesn't exist
            if(paramCommands.includes(command)){
                retObject.message = 'Command ' + command + ' requires parameters';
            } else{
                retObject.message = 'Command ' + command + ' is not valid';
            }
        }
    }

    if(retObject.valid == null){
        retObject.valid = false;
        retObject.message = 'Command ' + command + ' did not evaluate...';
    }
    return retObject;
}

function validateParameters(commandArr){
    
    // Create the return object
    paramRetObject = {};
    paramRetObject.valid = true;

    // Evaluate for the correct command
    switch(commandArr[0]){
        case 'up':
        case 'down':
        case 'left':
        case 'right':
        case 'forward':
        case 'back':
            if(commandArr.length > 2){
                paramRetObject.valid = false;
                paramRetObject.message = "Too many parameters for this command.";
                break;
            } else{
                var x = commandArr[1];
                if(x < 20 || x > 500){
                    paramRetObject.valid = false;
                    paramRetObject.message = "Movement command parameter must be a number between 20 and 500.";
                    break;
                }
            }
        case 'cw':
        case 'ccw':
            if(commandArr.length > 2){
                paramRetObject.valid = false;
                paramRetObject.message = "Too many parameters for this command.";
                break;
            } else{
                var x = commandArr[1];
                if(x < 20 || x > 500){
                    paramRetObject.valid = false;
                    paramRetObject.message = "Movement command parameter must be a number between 1 and 360.";
                    break;
                }
            }
        
            
    }

    return paramRetObject;

}