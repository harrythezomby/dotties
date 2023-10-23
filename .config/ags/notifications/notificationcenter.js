import {
    NotificationList, DNDSwitch, ClearButton, PopupList,
} from './notificationswidgets.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import { execAsync, timeout } from 'resource:///com/github/Aylur/ags/utils.js';
import Mpris from 'resource:///com/github/Aylur/ags/service/mpris.js';
import SystemTray from 'resource:///com/github/Aylur/ags/service/systemtray.js';

const WINDOW_NAME = 'testing';

const Date = () => Widget.Box({
    children: [
        Widget.Label({
            connections: [
                [1000, self => execAsync(['date', '+%a %b %e'])
                    .then(date => self.label = date).catch(console.error)],
            ],
        }),
    ]
})

const Media = () => Widget.Box({
    vertical: true,
    children: [
        Widget.Label({
            label: 'Media Controls'
        }),
        Widget.Button({
            halign: 'center',
            className: 'media',
            onPrimaryClick: () => Mpris.getPlayer('')?.playPause(),
            onScrollUp: () => Mpris.getPlayer('')?.next(),
            onScrollDown: () => Mpris.getPlayer('')?.previous(),
            child: Widget.Box({
                children: [
                    Widget.Label({
                        truncate: 'end',
                        //maxWidthChars: 24,
                        wrap: true,
                        halign: 'center',
                        connections: [[Mpris, self => {
                            const mpris = Mpris.getPlayer('');
                            // mpris player can be undefined
                            if (mpris)
                                self.label = `${mpris.trackArtists.join(', ')} - ${mpris.trackTitle}`;
                            else
                                self.label = 'Nothing is playing';
                        }]],
                    }),
                ]
            })
        }),
        Widget.Box({
            halign: 'center',
            children: [
                Widget.Button({
                    className: 'mediabtn',
                    onPrimaryClick: () => Mpris.getPlayer('')?.previous(),
                    child: Widget.Label("󰒮"),
                }),
                Widget.Button({
                    className: 'mediabtn',
                    onPrimaryClick: () => Mpris.getPlayer('')?.playPause(),
                    child: Widget.Label("󰐎"),
                }),
                Widget.Button({
                    className: 'mediabtn',
                    onPrimaryClick: () => Mpris.getPlayer('')?.next(),
                    child: Widget.Label("󰒭"),
                }),
                Widget.Button({
                    className: 'mediabtn',
                    onPrimaryClick: () => Mpris.getPlayer('')?.shuffle(),
                    child: Widget.Label("󰒟"),
                }),
                Widget.Button({
                    className: 'mediabtn',
                    onPrimaryClick: () => Mpris.getPlayer('')?.loop(),
                    child: Widget.Label(""),
                }),
            ]
        })
    ]
})




const SysTray = () => Widget.Box({
    className: 'tray',
    halign: 'center',
    connections: [[SystemTray, self => {
        self.children = SystemTray.items.map(item => Widget.Button({
            child: Widget.Icon({ binds: [['icon', item, 'icon']] }),
            onPrimaryClick: (_, event) => item.activate(event),
            onSecondaryClick: (_, event) => item.openMenu(event),
            binds: [['tooltip-markup', item, 'tooltip-markup']],
        }));
    }]],
});

const Header = () => Widget.Box({
    className: 'header',
    children: [
        Widget.Label(' '),
        DNDSwitch(),
        Widget.Box({ hexpand: false }),
        ClearButton(),
    ],
});

const seperatorHeader = () => Widget.Box({
    className: 'header',
    children: [
        Widget.Box({ hexpand: false }),
    ],
});

const NotificationCenter = () => Widget.Window({
    name: WINDOW_NAME,
    className: 'notificationCenterWindowOuter',
    visible: false,
    anchor: ['right', 'top'],
    popup: true,
    focusable: true,
    child: Widget.Box({
        children: [
            Widget.EventBox({
                hexpand: true,
                connections: [['button-press-event', () =>
                    App.closeWindow(WINDOW_NAME)]]
            }),
            Widget.Box({
                className: 'notificationCenterWindow',
                homogeneous: false,
                vertical: true,
                children: [
                    Widget.Box({
                        className: "notificationCenterControls",
                        halign: 'center',
                        children: [
                            Date(),
                            Widget.Label(' - System Center '),
                            Widget.Button({
                                className: 'notificationcenterclosebutton',
                                onClicked: () =>  App.toggleWindow('testing'),
                                child: Widget.Label({
                                    label: ''
                                })
                            }),
                        ]
                    }),
                    
                    SysTray(),
                    seperatorHeader(),
                    Media(),
                    seperatorHeader(),
                    Header(),
                    NotificationList(),
                ],
            }),
        ],
    }),
});

/* timeout(500, () => execAsync([
    'notify-send',
    'Notification Center example',
    'To have the panel popup run "ags toggle-window notification-center"' +
    '\nPress ESC to close it.',
]).catch(console.error)); */

// the window containing the PowerMenu
/* export default Widget.Window({
    name: WINDOW_NAME,
    child: NotificationCenter()
}) */

export default NotificationCenter({
    name: WINDOW_NAME,
    popup: true,
    focusable: true,

})