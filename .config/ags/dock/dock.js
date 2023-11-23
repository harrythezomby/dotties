import App from 'resource:///com/github/Aylur/ags/app.js';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import Applications from 'resource:///com/github/Aylur/ags/service/applications.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { launchApp } from './launchappfn.js';

import options from './dockoptions.js';
import icons from './dockicons.js';

const AppButton = ({ icon, ...rest }) => Widget.Button({
    ...rest,
    className: 'dockbuttons',
    child: Widget.Box({
        className: 'box',
        child: Widget.Overlay({
            child: Widget.Icon({ icon, size: options.dock.iconSize }),
            overlays: [Widget.Box({
                className: 'indicator',
                vpack: 'end',
                hpack: 'center',
            })],
        }),
    }),
});

const Taskbar = () => Widget.Box({
    binds: [['children', Hyprland, 'clients', c => c.map(client => {
        for (const appName of options.dock.pinnedApps) {
            if (client.class.toLowerCase().includes(appName.toLowerCase()))
                return null;
        }
        for (const app of Applications.list) {
            if (client.title && app.match(client.title) ||
                client.class && app.match(client.class)) {
                return AppButton({
                    icon: app.iconName,
                    tooltipText: app.name,
                    onMiddleClick: () => launchApp(app),
                    onPrimaryClick: () => Utils.execAsync(`hyprctl dispatch focuswindow address:${client.address}`),
                });
            }
        }
    })]],
});

const PinnedApps = () => Widget.Box({
    homogeneous: true,
    children: options.dock.pinnedApps
        .map(term => ({ app: Applications.query(term)?.[0], term }))
        .filter(({ app }) => app)
        .map(({ app, term = true }) => AppButton({
            icon: app.iconName,
            onPrimaryClick: () => {
                for (const client of Hyprland.clients) {
                    if (client.class.toLowerCase().includes(term)) {
                        Utils.execAsync(`hyprctl dispatch focuswindow address:${client.address}`).catch(print);
                        return;
                    }
                }

                launchApp(app);
            },
            onMiddleClick: () => launchApp(app),
            tooltipText: app.name,
            connections: [[Hyprland, button => {
                const running = Hyprland.clients
                    .find(client => client.class.toLowerCase().includes(term)) || false;

                button.toggleClassName('nonrunning', !running);
                button.toggleClassName('focused', Hyprland.active.client.address === running.address?.substring(2));
                button.set_tooltip_text(running ? running.title : app.name);
            }, 'notify::clients']],
        })),
});

export default () => {
    const pinnedapps = PinnedApps();
    const taskbar = Taskbar();
    const applauncher = AppButton({
        className: 'launcher nonrunning',
        icon: icons.apps.apps,
        tooltipText: 'Applications',
        onClicked: () => App.toggleWindow('applauncher'),
    });
    return Widget.Box({
        children: [applauncher, pinnedapps,taskbar],
    });
};
