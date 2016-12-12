# Sanada Camera
A camera that can be shot with Yukimura Sanada.

Original source of [cordova-plugin-sanada-camera](https://github.com/hitdev01/cordova-plugin-sanada-camera)

## Features
* This project uses nodejs
* The native source is stored under the `src` directory
* Run `npm run build` creates a file for cordova-plugin under the `dist` directory

## Supported Platforms
* Android


---
# Cordova Plugin Info

## Methods
* navigator.sanadacamera.start

## Example
### navigator.sanadacamera.start

```JavaScript
function onSuccess(uri) {
    // URI of photo taken
    alert(uri);
}

function onError() {
    alert('onError!');
}

navigator.sanadacamera.start(onSuccess, onError);
```
