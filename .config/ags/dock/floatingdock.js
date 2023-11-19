import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';


import Dock from './dock.js';


export default Widget.Window({
    monitor: 1,
    name: `dock`,
    className: 'floating-dock',
    anchor: ['bottom'],
    child: Widget.EventBox({
        valign: 'start',
        onHover: box => {
            Utils.timeout(300, () => box._revealed = true);
            box.child.children[0].revealChild = true;
        },
        onHoverLost: box => {
            if (!box._revealed)
                return;

            Utils.timeout(300, () => box._revealed = false);
            box.child.children[0].revealChild = false;
        },
        child: Widget.Box({
            vertical: true,
            css: 'padding: 1px;',
            children: [
                Widget.Revealer({
                    transition: 'slide_up',
                    child: Dock(),
                    setup: self => {
                        const update = () => {
                            const ws = Hyprland.getWorkspace(Hyprland.active.workspace.id);
                            self.revealChild = ws?.windows === 0;
                        };
                        //Utils.connect(Hyprland, self, update, 'client-added');
                        //Utils.connect(Hyprland, self, update, 'client-removed');
                        //Utils.connect(Hyprland.active.workspace, self, update);
                    },
                }),
                Widget.Box({
                    className: 'padding',
                    //style: 'padding: 2px;',
                }),
            ],
        }),
    }),
});