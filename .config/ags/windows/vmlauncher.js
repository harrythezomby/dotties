import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';

const WINDOW_NAME = 'vmmenu';

function sh(cmd) {
    return function() {
      Utils.execAsync(['bash', '-c', cmd]);
    }; 
  }

// widget representing a power menu item
const VMMenuItem = item => Widget.Button({
    className: 'vmButtons',
    onClicked: item.onClicked,
    child: Widget.Box({
        children: [
            Widget.Icon({
                className: 'vmIcons',
                icon: item.icon,
                size: 42,
            }),
            Widget.Label({
                className: 'smalltitle',
                label: item.label,
            }),
        ],
    }),
});

// widget showing a list of PowerMenuItems
const VMMenu = ({ items }) => {
    const list = Widget.Box({
        vertical: true,
        spacing: 12,
    });

    list.children = items.map(item => VMMenuItem(item));

    return Widget.Box({
        vertical: true,
        css: `margin: 12px;`,
        child: list,
    });
};

// the window containing the PowerMenu
export default Widget.Window({
    className: 'vmWindow',
    name: WINDOW_NAME,
    popup: true,
    visible: false,
    focusable: true,
    anchor: ['top', 'left'],
    child: Widget.Box({
        vertical: true,
        children: [
            Widget.Label({
                className: 'smalltitle',
                label: ' VM Controls',
            }),
            VMMenu({
                items: [
/*                     {
                        label: ' Close',
                        //icon: 'window-close',
                        onClicked: () =>  App.closeWindow('vmmenu'),
                    }, */
                    {
                        label: '󰐥 Power On',
                        //icon: 'system-shutdown',
                        onClicked: sh('virsh --connect qemu:///system start "win11"'),
                    },
                    {
                        label: ' View',
                        //icon: 'system-reboot',
                        onClicked: sh('virt-viewer -c qemu:///system "win11"'),
                    },
                    {
                        label: '󱇽 Looking Glass',
                        //icon: 'go-down',
                        onClicked: sh('looking-glass-client'),
                    },
                    {
                        label: '󰚦 Shut Down',
                        //icon: 'go-down',
                        onClicked: sh('virsh --connect qemu:///system shutdown "win11"'),
                    },
        
                ],
            }),]
        })
        
    })


