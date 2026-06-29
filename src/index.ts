import type {
    MIAOMCPassportConfig,
    PassportApiResponse,
    AppGenerateTicketResponse,
    AppTicketData,
    AppRedeemTicketResponse,
    AppIntrospectData,
    AppIntrospectRedeemResponse,
    AppIntrospectRotateResponse,
    AppPairwiseResolveEmailResponse
} from './types/passport'
import { PassportService } from './service/passport.service'

export class MIAOMCPassport {
    private PassportConfig: MIAOMCPassportConfig
    private passportService: PassportService

    constructor(config: MIAOMCPassportConfig) {
        this.PassportConfig = this.standardizeConfig(config)
        this.passportService = new PassportService(this.PassportConfig)
    }

    private standardizeConfig(config: MIAOMCPassportConfig): MIAOMCPassportConfig {
        const standardizedConfig: MIAOMCPassportConfig = {
            appId: config.appId,
            appSecret: config.appSecret,
            baseUrl: config.baseUrl || 'https://passport.miaomc.com/api/v1',
            advancedConfig: {
                authorizationHeader: {
                    appIdHeader: config.advancedConfig?.authorizationHeader?.appIdHeader || 'x-miaomc-app-id',
                    appNonceHeader: config.advancedConfig?.authorizationHeader?.appNonceHeader || 'x-miaomc-app-nonce',
                    appSignatureHeader:
                        config.advancedConfig?.authorizationHeader?.appSignatureHeader || 'x-miaomc-signature',
                    appSignatureExpiresHeader:
                        config.advancedConfig?.authorizationHeader?.appSignatureExpiresHeader ||
                        'x-miaomc-signature-expired-at',
                    appIntrospectTokenHeader:
                        config.advancedConfig?.authorizationHeader?.appIntrospectTokenHeader || 'x-miaomc-introspect'
                }
            }
        }

        return standardizedConfig
    }

    // ─── Ticket ──────────────────────────────────────────────────

    /**
     * 生成 App Ticket
     * @param redirectUrl - 授权成功后的回调地址
     * @returns ticket 和 redirectTo（Passport 授权页地址）
     */
    async generateTicket(redirectUrl: string) {
        return this.passportService.generateTicket(redirectUrl)
    }

    /**
     * 兑换 App Ticket
     * @param ticket - 从授权回调中获取的 ticket
     * @returns ticketData（包含 appId、userId、profileId、introspectToken 等）
     */
    async redeemTicket(ticket: string) {
        return this.passportService.redeemTicket(ticket)
    }

    // ─── Introspect ──────────────────────────────────────────────

    /**
     * 验证 Introspect Token 有效性
     * @param introspectToken - Introspect Token
     * @returns introspect_data 和 required_data
     */
    async redeemIntrospect(introspectToken: string) {
        return this.passportService.redeemIntrospect(introspectToken)
    }

    /**
     * 轮换 Introspect Token
     * @param introspectToken - 当前的 Introspect Token
     * @returns 新的 introspect_token
     */
    async rotateIntrospect(introspectToken: string) {
        return this.passportService.rotateIntrospect(introspectToken)
    }

    // ─── Pairwise ────────────────────────────────────────────────

    /**
     * 通过 Pairwise ID 解析真实邮箱
     * @param pairwiseId - Pairwise 标识 ID（即 Introspect Token 中返回的 profileId）
     * @returns 解析后的真实邮箱地址
     */
    async resolveEmail(pairwiseId: string) {
        return this.passportService.resolveEmail(pairwiseId)
    }
}

// Re-export types for consumers
export type {
    MIAOMCPassportConfig,
    PassportApiResponse,
    AppGenerateTicketResponse,
    AppTicketData,
    AppRedeemTicketResponse,
    AppIntrospectData,
    AppIntrospectRedeemResponse,
    AppIntrospectRotateResponse,
    AppPairwiseResolveEmailResponse
}
