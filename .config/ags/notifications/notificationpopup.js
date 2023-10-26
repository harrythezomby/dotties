import {
    NotificationList, DNDSwitch, ClearButton, PopupList,
} from './notificationswidgets.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import { execAsync, timeout } from 'resource:///com/github/Aylur/ags/utils.js';

const NotificationsPopupWindow = () => Widget.Window({
    name: 'popup-window',
    monitor: 1,
    anchor: ['top', 'right'],
    child: PopupList(),
});

export default {
    style: App.configDir + '/style.css',
    windows: [
        NotificationsPopupWindow(),
    ]
}