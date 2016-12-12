cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-plugin-sanada-camera.sanadacamera",
        "file": "plugins/cordova-plugin-sanada-camera/www/sanadacamera.js",
        "pluginId": "cordova-plugin-sanada-camera",
        "clobbers": [
            "navigator.sanadacamera"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.3.0",
    "cordova-plugin-sanada-camera": "0.0.1"
};
// BOTTOM OF METADATA
});