import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import App from 'resource:///com/github/Aylur/ags/app.js';


/** @type {function(Applications.Application): void}*/
export function launchApp(app) {
    Utils.execAsync(`hyprctl dispatch exec ${app.executable}`);
    app.frequency += 1;
}