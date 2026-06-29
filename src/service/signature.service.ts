import { createHmac } from 'crypto'
import type { MIAOMCPassportConfig } from '../types/passport'

export class SignatureService {
    private appId: string
    private appSecret: string

    constructor(config: MIAOMCPassportConfig) {
        this.appId = config.appId
        this.appSecret = config.appSecret
    }

    /**
     * 生成 HMAC-SHA256 签名
     * @param body - 请求体的 Buffer
     * @param nonce - 随机生成的唯一标识符
     * @param expiredAt - 签名过期时间（秒）
     */
    generateSignature(body: Buffer, nonce: string, expiredAt: number): string {
        const { appId, appSecret } = this

        const dataToSign = `${appId}:${nonce}:${expiredAt}:${body}`
        const calcSignature = createHmac('sha256', appSecret).update(dataToSign).digest('hex')

        return calcSignature
    }
}
