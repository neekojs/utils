import httpRequest from './http';

export default function (options) {
    if (Array.isArray(options)) {
        return Promise.all(options.map(v => httpRequest(v)));
    }
    return httpRequest(options);
}
