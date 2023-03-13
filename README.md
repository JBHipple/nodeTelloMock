# nodeTelloMock
Mock test server for DJI Tello interface development

NodeJS based UDP server that responds to DJI Tello commands based on SDK 3.0
The UDP server will only positively respond to commands outlined by the DJI Tello SDK v3.0

Do you want to develop an application for the DJI Tello on SDK v3.0, but you either don't have the drone, or don't want to risk damaging yours?  You need a mock server to develop against.  This project aims to solve that problem.  This is a nodeJS project that starts a UDP server listening on port 8889 (same as Tello) that accepts UDP messages, and validates them against the Tello SDK.  If the command is valid, the server responds with OK, just like the drone would.  If the command is not correct, you get a contextual error message telling you exactly what is wrong with the command you sent, so you can fix your application easier.

This project is designed to be run within a docker image, which runs the server.  That docker image can be found here:
https://hub.docker.com/r/jbhipple/tello-mock

To use the docker image, you will need to change your application's callout address from the Tello's address to localhost.  As long as you bind the correct ports when running the docker image, this is the only change that will need to happen, everything else should be seamless.

Current state:

- Accepts messages and responds.
- Validates that the command exists within the Tello SDK v3.0
- Parameter validation for the commands forward, backward, up, down, left, right, cw, ccw.
- Does not send a video stream to mimick the drone's camera.

To do:
- Split the command validation out into helper objects to better validate commands and make the code easier to manage
- Add contextual validation for all parameterized commands.
