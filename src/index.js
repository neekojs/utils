import '@babel/polyfill';
import AliYun from './upload/aliyun';
import QCloud from './upload/qcloud';
import QiNiu from './upload/qiniu';
import request from './request';

const Uploader = {
    AliYun,
    QCloud,
    QiNiu
};

export {
    Uploader,
    request
};
