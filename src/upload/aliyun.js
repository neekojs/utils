import AliOss from 'ali-oss';
import UploadInterface from './interface';

class Uploader extends UploadInterface {
    constructor(options) {
        super(options);
        const { ACCESS_KEY, SECRET_KEY, bucket, region = 'oss-cn-shanghai', endpoint } = this.options;

        this.client = new AliOss({
            accessKeyId: ACCESS_KEY,
            accessKeySecret: SECRET_KEY,
            region,
            bucket,
            endpoint,
        });
    }

    async uploadFile(localFile, cloudFile, options = {}) {
        const { debug } = this.options;
        const result = {
            status: false,
            data: { key: undefined, hash: undefined },
            error: null,
            response: null,
        };
        try {
            const ret = await this.client.put(cloudFile, localFile);
            const { res } = ret || {};
            result.status = res.status === 200 && res.statusCode === 200;
            result.response = res;
            if (result.status) {
                result.data.key = cloudFile;
                result.data.hash = res.headers['content-md5'];
            }

            if (debug) {
                if (result.status) console.log('upload', localFile, '->', cloudFile, 'succeed');
                else console.error('upload', localFile, '->', cloudFile, 'failed');
            }
        } catch (e) {
            console.log(e);
        }
        return result;
    }
}

export default Uploader;
