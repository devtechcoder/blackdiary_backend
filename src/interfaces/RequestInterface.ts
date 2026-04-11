import { Request, Response } from 'express';

export interface ReqInterface extends Request {
    startTime: number;
    errorStatus: number;
    userData: any;
    loginActivityMeta?: {
        ipAddress?: string;
        device?: string;
        browser?: string;
        os?: string;
        location?: string;
        userAgent?: string;
    };
}


/**
 * @interface
 * 
 */
export interface ResInterface extends Response {
    /**
     * @type {(message: string) => string} translation message
     */
    __: (message: string) => string;
    logMsg: string;
    startTime: number;
    api: string;
    method: string;
}
