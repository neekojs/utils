import QiNiu from 'qiniu';
import UploadInterface from './interface';

class Uploader extends UploadInterface {
    constructor(options) {
        super(options);
        const { ACCESS_KEY, SECRET_KEY, bucket, region = 'Zone_z0' } = this.options;
        const mac = new QiNiu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);
        const config = new QiNiu.conf.Config();
        config.zone = QiNiu.zone[region];

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

        return new Promise(resolve => {
            const { debug } = this.options;
            this.uploader.putFile(token, cloudFile, localFile, extra, function (err, ret = {}) {
                if (ret == null) ret = {};
                const result = {
                    status: !err,
                    data: {
                        key: ret.key,
                        hash: ret.hash
                    },
                    error: err,
                    response: ret,
                };

                if (debug) {
                    if (result.status) console.log('upload', localFile, '->', cloudFile, 'succeed');
                    else console.error('upload', localFile, '->', cloudFile, 'failed');
                }
                resolve(result);
            });
        });
    }
}

export default Uploader;
