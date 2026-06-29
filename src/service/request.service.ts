import axios, { type AxiosResponse } from 'axios'
import { randomUUID } from 'crypto'
import type { MIAOMCPassportConfig, PassportApiResponse } from '../types/passport'
import { SignatureService } from './signature.service'

export class RequestService {
    private PassportConfig: MIAOMCPassportConfig
    private signatureService: SignatureService
    private appIdHeader: string
    private appNonceHeader: string
    private appSignatureHeader: string
    private appSignatureExpiresHeader: string
    private appIntrospectTokenHeader: string

    constructor(config: MIAOMCPassportConfig) {
        this.PassportConfig = config
        this.signatureService = new SignatureService(config)
        this.appIdHeader = config.advancedConfig?.authorizationHeader?.appIdHeader || 'x-miaomc-app-id'
        this.appNonceHeader = config.advancedConfig?.authorizationHeader?.appNonceHeader || 'x-miaomc-app-nonce'
        this.appSignatureHeader = config.advancedConfig?.authorizationHeader?.appSignatureHeader || 'x-miaomc-signature'
        this.appSignatureExpiresHeader =
            config.advancedConfig?.authorizationHeader?.appSignatureExpiresHeader || 'x-miaomc-signature-expired-at'
        this.appIntrospectTokenHeader =
            config.advancedConfig?.authorizationHeader?.appIntrospectTokenHeader || 'x-miaomc-introspect'
    }

    /**
     * 发送包含鉴权信息的请求
     * @param method - 请求方法
     * @param expiresSeconds - 签名过期时间（秒）
     * @param url - 请求 URL
     * @param options - 请求选项，包括请求体、查询参数和 introspect token
     * @returns Promise<PassportApiResponse<T>>
     */
    async sendRequest<T>(
        method: 'GET' | 'POST',
        expiresSeconds: number,
        url: string,
        options?: {
            body?: Record<string, unknown>
            query?: Record<string, string>
            introspectToken?: string
        }
    ): Promise<PassportApiResponse<T>> {
        let finalUrl = this.PassportConfig.baseUrl
        if (url.startsWith('/')) finalUrl += url
        else finalUrl += `/${url}`

        // 添加查询参数到 URL 如果需要
        if (options?.query) {
            const params = new URLSearchParams(options.query)
            finalUrl += `?${params.toString()}`
        }

        // 生成签名和请求头
        const nonce = randomUUID()
        const expiredAt = Math.floor(Date.now() / 1000) + expiresSeconds

        const bodyBuffer = Buffer.from(options?.body ? JSON.stringify(options.body) : '')
        const signature = this.signatureService.generateSignature(bodyBuffer, nonce, expiredAt)

        const requestHeaders: Record<string, string | number> = {
            [this.appIdHeader]: this.PassportConfig.appId,
            [this.appNonceHeader]: nonce,
            [this.appSignatureHeader]: signature,
            [this.appSignatureExpiresHeader]: expiredAt
        }

        // 是否包含 introspect token
        if (options?.introspectToken) {
            requestHeaders[this.appIntrospectTokenHeader] = options.introspectToken
        }

        const response: AxiosResponse<PassportApiResponse<T>> = await axios({
            headers: requestHeaders,
            method,
            url: finalUrl,
            data: method === 'POST' ? options?.body : undefined
        })

        return response.data
    }
}
