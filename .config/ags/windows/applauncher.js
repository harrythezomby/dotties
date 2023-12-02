import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import Applications from 'resource:///com/github/Aylur/ags/service/applications.js';

const WINDOW_NAME = 'applauncher';

//  widget representing an app
const AppItem = app => Widget.Button({
    className: 'applauncherbuttons',
    onClicked: () => {
        App.closeWindow(WINDOW_NAME);
        app.launch();
    },
    child: Widget.Box({
        className: 'applauncherentries',
        children: [
            Widget.Icon({
                className: 'applauncherentries',
                icon: app.iconName,
                size: 42,
            }),
            Widget.Box({
                className: 'applauncherentries',
                vertical: true,
                valign: 'center',
                children: [
                    Widget.Label({
                        className: 'applaunchertitles',
                        label: app.name,
                        //xalign: 0,
                        valign: 'center',
                        truncate: 'end',
                    }),
                    Widget.Label({
                        className: 'applauncherdescriptions',
                        label: app.description || '',
                        wrap: true,
                        //xalign: 0,
                        justification: 'left',
                        valign: 'center',
                    }),
                ],
            }),
        ],
    }),
});

// widget showing an entry and list of AppItems
const Applauncher = ({ width, height, spacing }) => {
    const list = Widget.Box({
        vertical: true,
        spacing,
    });

    const entry = Widget.Entry({
        hexpand: true,
        css: `margin-bottom: ${spacing}px;`,

        // set some text so onChange works the first time
        text: ' ',

        // to launch the first item on Enter
        onAccept: ({ text }) => {
            const list = Applications.query(text);
            if (list[0]) {
                App.toggleWindow(WINDOW_NAME);
                list[0].launch();
            }
        },

        // filter out the list
        onChange: ({ text }) => {
            list.children = Applications.query(text).map(AppItem);
        },
    });




    return Widget.Box({
        className: 'applaunchersecondwindow',
        vertical: true,
        css: `margin: ${spacing * 2}px;`,
        children: [
            Widget.Box({
                halign: 'center',
                children: [
                    Widget.Label({
                        className: 'smalltitle',
                        label: '󰣇 Applications '
                    }),
/*                     Widget.Button({
                        className: 'applauncherclose',
                        onClicked: () =>  App.closeWindow('applauncher'),
                        child: Widget.Label({
                            className: 'smallertitle',
                            label: ' Close',
                        })
                    }), */
            
                ]
            }),
            entry,

            // wrap the list in a scrollable
            Widget.Scrollable({
                hscroll: 'never',
                css: `
                    min-width: ${width}px;
                    min-height: ${height}px;
                `,
                child: list,
            }),
        ],

        // make entry.text empty on launch
        connections: [[App, (_, name, visible) => {
            if (name !== WINDOW_NAME)
                return;

            entry.text = '';
            if (visible)
                entry.grab_focus();
        }]],
    });
};

// the window containing the Applauncher
export default Widget.Window({
    name: WINDOW_NAME,
    className: 'applauncherwindow',
    anchor: ['top', 'left'],
    popup: true,
    focusable: true,
    visible: false,
    child: Applauncher({
        width: 300,
        height: 800,
        spacing: 12,
    }),
});
