import type {
    MIAOMCPassportConfig,
    PassportApiResponse,
    AppGenerateTicketResponse,
    AppRedeemTicketResponse,
    AppIntrospectRedeemResponse,
    AppIntrospectRotateResponse,
    AppPairwiseResolveEmailResponse
} from '../types/passport'
import { RequestService } from './request.service'

const DEFAULT_EXPIRES_SECONDS = 30

export class PassportService {
    private requestService: RequestService

    constructor(config: MIAOMCPassportConfig) {
        this.requestService = new RequestService(config)
    }

    /**
     * 生成 App Ticket
     * POST /app/ticket/generate
     * @param redirectUrl - 授权成功后的回调地址
     */
    async generateTicket(redirectUrl: string): Promise<PassportApiResponse<AppGenerateTicketResponse>> {
        return this.requestService.sendRequest<AppGenerateTicketResponse>(
            'POST',
            DEFAULT_EXPIRES_SECONDS,
            '/app/ticket/generate',
            { body: { redirect_url: redirectUrl } }
        )
    }

    /**
     * 兑换 App Ticket
     * POST /app/ticket/redeem
     * @param ticket - 从授权回调中获取的 ticket
     */
    async redeemTicket(ticket: string): Promise<PassportApiResponse<AppRedeemTicketResponse>> {
        return this.requestService.sendRequest<AppRedeemTicketResponse>(
            'POST',
            DEFAULT_EXPIRES_SECONDS,
            '/app/ticket/redeem',
            { body: { ticket } }
        )
    }

    /**
     * 验证 Introspect Token 有效性
     * GET /app/introspect/redeem
     * @param introspectToken - Introspect Token
     */
    async redeemIntrospect(introspectToken: string): Promise<PassportApiResponse<AppIntrospectRedeemResponse>> {
        return this.requestService.sendRequest<AppIntrospectRedeemResponse>(
            'GET',
            DEFAULT_EXPIRES_SECONDS,
            '/app/introspect/redeem',
            { introspectToken }
        )
    }

    /**
     * 轮换 Introspect Token
     * POST /app/introspect/rotate
     * @param introspectToken - 当前的 Introspect Token
     */
    async rotateIntrospect(introspectToken: string): Promise<PassportApiResponse<AppIntrospectRotateResponse>> {
        return this.requestService.sendRequest<AppIntrospectRotateResponse>(
            'POST',
            DEFAULT_EXPIRES_SECONDS,
            '/app/introspect/rotate',
            { introspectToken }
        )
    }

    /**
     * 通过 Pairwise ID 解析真实邮箱
     * GET /app/pairwise/resolve-email
     * @param pairwiseId - Pairwise 标识 ID（即 Introspect Token 中返回的 profileId）
     */
    async resolveEmail(pairwiseId: string): Promise<PassportApiResponse<AppPairwiseResolveEmailResponse>> {
        return this.requestService.sendRequest<AppPairwiseResolveEmailResponse>(
            'GET',
            DEFAULT_EXPIRES_SECONDS,
            '/app/pairwise/resolve-email',
            { query: { pairwise_id: pairwiseId } }
        )
    }
}
