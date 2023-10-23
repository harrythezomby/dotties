import Service from 'resource:///com/github/Aylur/ags/service/service.js';
class BrightnessService extends Service {
    static {
        // every subclass of GObject.Object has to register itself
        // takes three arguments
        // the class itself
        // an object defining the signals
        // an object defining its properties
        Service.register(
            this,
            {
                // 'name-of-signal': [type as a string from GObject.TYPE_<type>],
                'screen-changed': ['float'],
            },
            {
                // 'kebab-cased-name': [type as a string from GObject.TYPE_<type>, 'r' | 'w' | 'rw']
                // 'r' means readable
                // 'w' means writable
                // guess what 'rw' means
                'screen-value': ['float', 'rw'],
            },
        );
    }

    _screenValue = 0;

    // the getter has to be in snake_case
    get screen_value() { return this._screenValue; }

    // the setter has to be in snake_case too
    set screen_value(percent) {
        if (percent < 0)
            percent = 0;

        if (percent > 1)
            percent = 1;

        Utils.execAsync(`brightnessctl s ${percent * 100}% -q`)
            .then(() => {
                this._screen = percent;

                // signals has to be explicity emitted
                this.emit('changed'); // emits "changed"
                this.notify('screen'); // emits "notify::screen"

                // or use Service.changed(propName: string) which does the above two
                // this.changed('screen');
            })
            .catch(print);
    }

    constructor() {
        super();
        const current = Number(exec('brightnessctl g'));
        const max = Number(exec('brightnessctl m'));
        this._screenValue = current / max;
    }

    // overwriting the connect method, let's you
    // change the default event that widgets connect to
    connect(event = 'screen-changed', callback) {
        return super.connect(event, callback);
    }
}

// the singleton instance
const service = new BrightnessService();

// make it global for easy use with cli
globalThis.brightness = service;

// export to use in other modules
export default service;