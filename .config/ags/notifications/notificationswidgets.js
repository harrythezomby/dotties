import { Notification } from './notification.js';
import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';
import Gtk from 'gi://Gtk';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';

const List = () => Widget.Box({
    css: 'min-width: 200px;',
    vertical: true,
    vexpand: true,
    connections: [[Notifications, self => {
        self.children = Notifications.notifications
            .reverse()
            .map(Notification);

        self.visible = Notifications.notifications.length > 0;
    }]],
});

const Placeholder = () => Widget.Box({
    className: 'placeholder',
    vertical: true,
    vexpand: true,
    valign: 'center',
    children: [
        Widget.Icon('notifications-disabled-symbolic'),
        Widget.Label('Your inbox is empty'),
    ],
    binds: [
        ['visible', Notifications, 'notifications', n => n.length === 0],
    ],
});

export const NotificationList = () => Widget.Scrollable({
    className: 'notificationScrollable',
    hscroll: 'never',
    vscroll: 'automatic',
    child: Widget.Box({
        className: 'notificationScrollable',
        vertical: true,
        children: [
            List(),
            Placeholder(),

        ],
    }),
})



export const ClearButton = () => Widget.Button({
    className: 'notificationButton',
    onClicked: () => Notifications.clear(),
    binds: [
        ['sensitive', Notifications, 'notifications', n => n.length > 0],
    ],
    child: Widget.Box({
        children: [
            Widget.Icon({
                binds: [
                    ['icon', Notifications, 'notifications', n =>
                        `user-trash-${n.length > 0 ? 'full-' : ''}symbolic`],
                ],
            }),
            Widget.Label({
                label: 'Clear',
                className: 'smallertitle',
            })
        ],
    }),
});

export const DNDSwitch = () => Widget({
    type: Gtk.Switch,
    valign: 'center',
    connections: [['notify::active', ({ active }) => {
        Notifications.dnd = active;
    }]],
});

export const PopupList = () => Widget.Box({
    className: 'list',
    vertical: true,
    binds: [['children', Notifications, 'popups',
        popups => popups.map(Notification)]],
});