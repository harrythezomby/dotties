import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

const WINDOW_NAME = 'powermenu';

// widget representing a power menu item
const PowerMenuItem = item => Widget.Button({
    className: 'powermenuButtons',
    onClicked: item.onClicked,
    child: Widget.Box({
        children: [
            Widget.Icon({
                className: 'powermenuIcons',
                icon: item.icon,
                size: 42,
            }),
            Widget.Label({
                label: item.label,
                className: 'smalltitle',
            }),
        ],
    }),
});

// widget showing a list of PowerMenuItems
const PowerMenu = ({ items }) => {
    const list = Widget.Box({
        
        vertical: true,
        spacing: 12,
    });

    list.children = items.map(item => PowerMenuItem(item));

    return Widget.Box({
        vertical: true,
        style: `margin: 12px;`,
        child: list,
    });
};

// the window containing the PowerMenu
export default Widget.Window({
    name: WINDOW_NAME,
    className: 'powermenuwindow',
    popup: true,
    focusable: true,
    visible: false,
    anchor: ['top', 'left'],
    child: Widget.Box({
        vertical: true,
        children: [
            Widget.Label({
                className: 'smalltitle',
                label: '⏻ Power Menu'
            }),
            PowerMenu({
                items: [
                    {
                        label: ' Close',
                        //icon: 'window-close',
                        onClicked: () =>  App.closeWindow('powermenu'),
                    },
                    {
                        label: '󰐥 Shutdown',
                        //icon: 'system-shutdown',
                        onClicked: 'systemctl poweroff',
                    },
                    {
                        label: ' Restart',
                        //icon: 'system-reboot',
                        onClicked: 'systemctl reboot',
                    },
                    {
                        label: '󰤄 Suspend',
                        //icon: 'go-down',
                        onClicked: 'systemctl suspend',
                    },
                    {
                        label: ' Lock Screen',
                        //icon: 'system-lock-screen',
                        onClicked: 'loginctl lock-session ${XDG_SESSION_ID-}',
                    },
                    {
                        label: ' Hibernate',
                        //icon: 'media-floppy',
                        onClicked: 'systemctl hibernate',
                    },
                    {
                        label: ' Log Out',
                        //icon: 'system-log-out',
                        onClicked: 'loginctl terminate-session ${XDG_SESSION_ID-}',
                    },
                ],
            }),]
        }),  
    })
    
