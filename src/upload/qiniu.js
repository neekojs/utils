const fs = require('fs');
const { join } = require('path');
import QiNiu from 'qiniu';

class Uploader {
    constructor(options) {
        const { ACCESS_KEY, SECRET_KEY, bucket, zone = 'Zone_z0' } = options;
        const mac = new QiNiu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);
        const config = new QiNiu.conf.Config();
        config.zone = QiNiu.zone[zone];

        this.uploader = new QiNiu.form_up.FormUploader(config);
        this.manager = new QiNiu.rs.BucketManager(mac, config);
        this.cdnManager = new QiNiu.cdn.CdnManager(mac);

        this.mac = mac;
        this.bucket = bucket;
        this.config = config;
    }

    generateToken(key) {
        let putPolicy = new QiNiu.rs.PutPolicy({
            scope: this.bucket + ':' + key
        });
        return putPolicy.uploadToken(this.mac);
    }

    uploadFile(localFile, cloudFile, options = {}) {
        const extra = new QiNiu.form_up.PutExtra();
        const token = options.token ? options.token : this.generateToken(cloudFile);

        return new Promise((resolve, reject) => {
            this.uploader.putFile(token, cloudFile, localFile, extra, function (err, ret) {
                console.log(err, ret);
                err ? reject(ret) : resolve(ret);
            });
        });
    }

    async uploadDir(dirPath, cdnPath) {
        console.log(dirPath);
        const fileArr = fs.readdirSync(dirPath);
        for (let i = 0, l = fileArr.length; i < l; i++) {
            const filepath = join(dirPath, fileArr[i]);
            const stat = fs.statSync(filepath);
            if (stat.isFile()) {
                await this.uploadFile(filepath, `${cdnPath}${fileArr[i]}`)
            } else {
                await this.uploadDir(filepath, `${cdnPath}${fileArr[i]}/`)
            }
        }
    }
}

export default Uploader;
