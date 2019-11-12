const fs = require('fs');
const { join } = require('path');

const defaultOptions = {
    debug: false,
    ACCESS_KEY: '',
    SECRET_KEY: '',
    bucket: undefined,
    region: undefined,
};

export default class UploadInterface {
    constructor(options) {
        this.options = Object.assign({}, defaultOptions, options);
    }

    async uploadFile(localFile, cloudFile, options = {}) {
        console.error('uploadFile function must be rewrite');
    }

    async uploadDir(dirPath, cdnPath = '') {
        if (cdnPath && cdnPath.length > 0) {
            if (cdnPath.startsWith('/')) {
                cdnPath = cdnPath.slice(1);
            }
            if (cdnPath.length > 0 && cdnPath.endsWith('/')) {
                cdnPath = cdnPath.slice(0, cdnPath.length - 1);
            }
        }
        const fileArr = fs.readdirSync(dirPath);
        for (let i = 0, l = fileArr.length; i < l; i++) {
            const filepath = join(dirPath, fileArr[i]);
            const stat = fs.statSync(filepath);
            if (stat.isFile()) {
                await this.uploadFile(filepath, `${cdnPath}/${fileArr[i]}`);
            } else {
                await this.uploadDir(filepath, `${cdnPath}/${fileArr[i]}/`);
            }
        }
    }
}
