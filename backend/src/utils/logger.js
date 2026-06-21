const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
    info: (...args) => {
        if (isDev) {
            console.log('\x1b[34m[INFO]\x1b[0m', new Date().toISOString(), ...args);
        }
    },
    warn: (...args) => {
        if (isDev) {
            console.warn('\x1b[33m[WARN]\x1b[0m', new Date().toISOString(), ...args);
        }
    },
    error: (...args) => {
        // We log errors even in production, but in dev we can add extra trace info if needed
        console.error('\x1b[31m[ERROR]\x1b[0m', new Date().toISOString(), ...args);
    },
    debug: (...args) => {
        if (isDev) {
            console.debug('\x1b[36m[DEBUG]\x1b[0m', new Date().toISOString(), ...args);
        }
    }
};
