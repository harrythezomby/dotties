//AGS Stuff 
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';
import Audio from 'resource:///com/github/Aylur/ags/service/audio.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { exec, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';
import Network from 'resource:///com/github/Aylur/ags/service/network.js';
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import Variable from 'resource:///com/github/Aylur/ags/variable.js';
import Bluetooth from 'resource:///com/github/Aylur/ags/service/bluetooth.js';
import Battery from 'resource:///com/github/Aylur/ags/service/battery.js';

//Local Files
import applauncher from './windows/applauncher.js';
import power from './windows/power.js';
import vmmenu from './windows/vmlauncher.js';
import testing from './notifications/notificationcenter.js';
import notificationpopup from './notifications/notificationpopup.js';
import dock from './dock/floatingdock.js';
//import Brightness from './services/backlight.js';

const Power = () => Widget.Button({
    className: 'power',
    onClicked: () =>  App.openWindow('powermenu'),
    child: Widget.Label({
        label: '',
    }),
});

const Apps = () => Widget.Button({
    className: 'apps',
    onClicked: () =>  App.toggleWindow('applauncher'),
    child: Widget.Label({
        label: '󰣇',
    }),
});

const VM = () => Widget.Button({
    className: 'vm',
    onClicked: () =>  App.openWindow('vmmenu'),
    child: Widget.Label({
        label: '',
    }),
});


const Notification = () => Widget.Button({
    halign: 'center',
    valign: 'center',
    className: 'notibutton',
    onClicked: () =>  App.toggleWindow('testing'),
    child: Widget.Box({
        halign: 'center',
        className: 'notification',
        children: [
            Widget.Icon({
                className: 'notificationbuttonalert',
                icon: 'preferences-system-notifications-symbolic',
                connections: [
                    [Notifications, self => self.visible = Notifications.popups.length > 0],
                ],
            }),
            Widget.Label({
                halign: 'center',
                className: 'notibuttondefaulticon',
                label: '󰒓',
                connections: [
                    [Notifications, self => self.visible = Notifications.popups.length < 1],
                ],
            }),
            Widget.Label({
                maxWidthChars: 15,
                truncate: 'end',
                wrap: false,
                className: 'notificationbuttonalert',
                connections: [[Notifications, self => {
                    self.label = Notifications.popups[0]?.appName || '';
                }]],
            }),
        ],
    })
})



const focusedTitle = Widget.Label({
    binds: [
        ['label', Hyprland.active.client, 'title'],
        ['visible', Hyprland.active.client, 'address', addr => !!addr],
    ],
});

const dispatch = ws => Utils.execAsync(`hyprctl dispatch workspace ${ws}`);

const Workspaces = () => Widget.EventBox({
    className: 'workspaces',
    onScrollUp: () => dispatch('+1'),
    onScrollDown: () => dispatch('-1'),
    child: Widget.Box({
        className: 'workspacebackground',
        children: Array.from({ length: 10 }, (_, i) => i + 1).map(i => Widget.Button({
            setup: btn => btn.id = i,
            label: `${i}`,
            onClicked: () => dispatch(i),
        })),

        // remove this connection if you want fixed number of buttons
        connections: [[Hyprland, box => box.children.forEach(btn => {
            btn.visible = Hyprland.workspaces.some(ws => ws.id === btn.id);
            btn.toggleClassName('focused', Hyprland.active.workspace.id === btn.id);
            
        })]],
    }),
});

const ClientTitle = () => Widget.Label({
    className: 'client-title',
    binds: [
      ['label', Hyprland.active.client, 'title', p => p || 'Hyprland | Harija'],
    ],
  });

const Language = () => Widget.Label({
    connections: [[Hyprland, (self, keyboardname, layoutname) => {
        print(keyboardname, layoutname);
        self.label = `${layoutname}` || '';
    }]],


})

const Clock = () => Widget.Box({
    className: 'clock',
    children: [
        Widget.Label({
            label: "  ",
        }),
        Widget.Label({
            connections: [
                [1000, self => execAsync(['date', '+%l:%M:%S %p'])
                    .then(date => self.label = date).catch(console.error)],
            ],
        }),
    ]
})// 

const Volume = () => Widget.Button({
    className: 'volume',
    onClicked: () => Audio.speaker.isMuted = !Audio.speaker.isMuted,
    onScrollUp: () => Audio.speaker.volume +=0.01,
    onScrollDown: () => Audio.speaker.volume -=0.01,
    onSecondaryClick: () => Utils.execAsync(['pavucontrol'])
    .then(out => print(out))
    .catch(err => print(err)),
    child: Widget.Box({
        spacing: 8,
        homogeneous: false,
        vertical: false,
        children: [
            Widget.Icon({
                className: 'icon',
                connections: [[Audio, self => {
                    if (!Audio.speaker)
                        return;

                    const vol = Audio.speaker.volume * 100;
                    const icon = [
                        [101, 'overamplified'],
                        [67,  'high'],
                        [34,  'medium'],
                        [1,   'low'],
                        [0,   'muted'],
                    ].find(([threshold]) => threshold <= vol)[1];

                    self.label = `Volume ${Math.floor(vol)}%`;
                    self.icon = `audio-volume-${icon}-symbolic`;
                    self.tooltipText = `Volume ${Math.floor(vol)}%`;
                }, 'speaker-changed']],
            }),
            Widget.Label({
                connections: [[Audio, self => {
                    if (!Audio.speaker)
                        return;

                    const vol = Audio.speaker.volume * 100;
                    const icon = [
                        [101, 'overamplified'],
                        [67,  'high'],
                        [34,  'medium'],
                        [1,   'low'],
                        [0,   'muted'],
                    ].find(([threshold]) => threshold <= vol)[1];

                    self.label = `${Math.floor(vol)}%`;
                    self.icon = `audio-volume-${icon}-symbolic`;
                    self.tooltipText = `${Audio.speaker.description}`;
                }, 'speaker-changed']],
            }),
        ],
    }),
});

const networkIndicator = () => Widget.Button({
    className: 'network',
    onClicked: () => Utils.execAsync(['nm-connection-editor'])
    .then(out => print(out))
    .catch(err => print(err)),
    child: Widget.Box({
        spacing: 8,
        homogeneous: false,
        vertical: false,
        children: [
            Widget.Stack({
                items: [
                    ['wifi', Widget.Icon({
                        connections: [[Network, self => {
                            self.icon = Network.wifi?.iconName || '';
                        }]],
                    })],
                    ['wired', Widget.Icon({
                        connections: [[Network, self => {
                            self.icon = Network.wired?.iconName || '';
                        }]],
                    })],
                ],
                binds: [['shown', Network, 'primary', p => p || 'wifi']],
            }),
            Widget.Label({
                connections: [[Network, self => {
                    self.label = Network.wifi?.ssid || '';
                }]],
            }),
        ],
    }),
});




const BT = () => Widget.Button({
    className: 'bluetooth',
    onClicked: () => Utils.execAsync(['blueman-manager'])
    .then(out => print(out))
    .catch(err => print(err)),
    child: Widget.Box({
        spacing: 8,
        homogeneous: false,
        vertical: false,
        children: [
            Widget.Icon({
                binds: [['icon', Bluetooth, 'enabled', on =>
                    `bluetooth-${on ? 'active' : 'disabled'}-symbolic`]],
            }),
            Widget.Box({
                connections: [[Bluetooth, self => {
                    self.children = Bluetooth.connectedDevices
                        .map(({iconName, name}) => Label({
                            indicator: Widget.Icon(iconName+'-symbolic'),
                            child: Widget.Label(name),
                        }));
            
                    self.visible = Bluetooth.connectedDevices.length > 0;
                }, 'notify::connected-devices']],
            }),
            Widget.Label({
                connections: [[Bluetooth, self => {
                    self.label = `${Bluetooth.connectedDevices.length}`;
            }]]

            })
        ],
    }),
});

const command = "grep 'cpu MHz' '/proc/cpuinfo' | awk '{total += $4} END {print total / NR / 1000}'";

const ram = Variable('0', {
    poll: [1000, ['bash', '-c', 'free -h | awk \'/^Mem:/ {print $3 \"/\" $2}\'']],
  });

  const ramLabel = () => Widget.Box({
    className: 'ram',
    halign: 'center',
    children: [
        Widget.Label({
            label: "  ",
            halign: 'center',
        }),
        Widget.Label({
            binds: [['label', ram]],
            halign: 'center',
        })
    ]
})

const cpughz = Variable('0', {
    poll: [1000, ['bash', '-c', 'awk \'/cpu MHz/ {sum+=$4; count++} END {printf "%.2f GHz", sum/count/1000}\' /proc/cpuinfo']],
  });

const cpuutil = Variable('0', {
    poll: [1000, ['bash', '-c', 'top -bn1 | grep "%Cpu(s)" | awk \'{print $2 + $4}\' | awk -F. \'{print $1"%"}\'']],
  });

const cputemp = Variable('0', {
    poll: [10000, ['bash', '-c', 'sensors | awk \'/CPUTIN/ {print $2}\' | sed \'s/+//\'']],
});

const cpufan = Variable('0', {
    poll:[5000, ['bash', '-c', 'sensors | awk \'/fan1/ {print $2 " rpm"}\' | sed \'s/+//\'']],
})

const kernelver = Variable('0', {
    poll:[999999, ['bash', '-c', 'uname -r']],
})

  const cpughzLabel = () => Widget.Label({
    binds: [['label', cpughz]],
    halign: 'center',
  });

  const cpuutilLabel = () => Widget.Label({
    binds: [['label', cpuutil]],
    halign: 'center',
  });

  const cputempLabel = () => Widget.Label({
    binds: [['label', cputemp]],
  });

  const cpufanLabel = () => Widget.Label({
    binds: [['label', cpufan]],
  });

const cpuLabel = () => Widget.Box ({
    halign: 'center',
    className: 'cpu',
    children: [
        Widget.Label({
            halign: 'center',
            label: "  "
        }),
        cpuutilLabel({
            halign: 'center',
        }),
        Widget.Label ({
            halign: 'center',
            label: " | "
        }),
        cpughzLabel({
            halign: 'center',
        }),
    ]
})

const tempLabel = () => Widget.Box({
    halign: 'center',
    className: 'temp',
    children: [
        Widget.Label(" "),
        cputempLabel(),
    ]
})

const fanLabel = () => Widget.Box({
    halign: 'center',
    className: 'fan',
    children: [
        Widget.Label("󰈐 "),
        cpufanLabel(),
    ]
})

const kernelLabel = () => Widget.Label({
    halign: 'center',
    binds: [['label', kernelver]],
  });

const kernel = () => Widget.Button({
    className: 'kernel',
    halign: 'center',
    child: Widget.Box({
        halign: 'center',
        children: [
            Widget.Label(" "),
            kernelLabel(),
    
        ]
    }),
})

const batteryAvailable = ({
    connections: [
        [Battery, self => {
            self.batteryAvailable = (`${Battery.available}`);
        }]
    ]
})


const batteryProgress = () => {

    if (batteryAvailable) {
      return Widget.Button({
        className: 'battery',
        child: Widget.Label({
            label: '  PC',
        })
      });
    }
  
    return Widget.Button({
      halign: 'center',
      className: 'battery',
      child: Widget.Box({
        children: [
          Widget.CircularProgress({
            halign: 'center',
            className: 'progress',
            child: Widget.Icon({
              binds: [['icon', Battery, 'icon-name']],
            }),
            binds: [
              ['value', Battery, 'percent', p => p > 0 ? p / 100 : 0],
              ['pc', Battery, 'aaaa', p => p <= 0 ? 'PC' : p],
              ['className', Battery, 'charging', c => c ? 'charging' : ''],
            ],
          }),
          Widget.Label({
            halign: 'center',
            binds: [
              ['value', Battery, 'percent', p => p > 0 ? p / 100 : 0],
              ['className', Battery, 'charging', c => c ? 'charging' : ''],            ],
            label: `${Battery.percent}%`
          })
        ]
      })
    });
  };


const backlight = () => {
    const batteryAvailable = Battery.available;
    if (!batteryAvailable) {
      return Widget.Button({
        className: 'backlight',
        child: Widget.Label({
            label: '󰍹  PC',
        })
      });
    }
  
    return Widget.Box({
        children: [
            Label({
/*                 binds: [
                    ['label', Brightness, 'screen-value', v => `${v}`],
                ],
            
                connections: [
                    [Brightness, self => {
                        // all three are valid
                        self.label = `${Brightness.screenValue}`;
                        self.label = `${Brightness.screen_value}`;
                        self.label = `${Brightness['screen-value']}`;
                    }, 'notify::screen-value'],
                ] */
                label: "Backlight",
            }),
        ]
    })
}

// layout of the bar
const Left = () => Widget.Box({
    children: [
        Power(),
        Apps(),
        VM(),
        Workspaces(),
        ramLabel(),
        cpuLabel(),
        tempLabel(),
        fanLabel(),
        
    ],
});

const Center = () => Widget.Box({
    children: [
        ClientTitle(),
        
    ],
});

//'cat /proc/cpuinfo | grep "cpu MHz" | cut -f2 | uniq | awk \'{sum += $1; count++} END {print sum / count}\'',


const Right = () => Widget.Box({
    hpack: 'end',
    children: [
        Volume(),
        networkIndicator(),
        BT(),
        batteryProgress(),
        backlight(),
        kernel(),
        Clock(),
        Notification(),
    ],
});

const Bar = ({ monitor } = {}) => Widget.Window({
    name: `bar-${monitor}`, // name has to be unique
    className: 'bar',
    monitor,
    anchor: ['top', 'left', 'right'],
    exclusive: true,
    child: Widget.CenterBox({
        startWidget: Left(),
        centerWidget: Center(),
        endWidget: Right(),
    }),
})

// exporting the config so ags can manage the windows
export default {
    maxStreamVolume: 1,
    style: App.configDir + '/style.css',
    windows: [
        //Bar(),

        // you can call it, for each monitor
        //FloatingDock({monitor: 1}),
        Bar({ monitor: 1 }),

        applauncher,
        power,
        vmmenu,
        testing,
        notificationpopup,
        dock,
    ],
};
