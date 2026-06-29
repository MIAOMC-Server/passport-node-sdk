// ─── Config ──────────────────────────────────────────────────────

type MIAOMCPassportConfig = {
    appId: string
    appSecret: string
    baseUrl?: string

    advancedConfig?: {
        authorizationHeader?: {
            appIdHeader?: string
            appNonceHeader?: string
            appSignatureHeader?: string
            appSignatureExpiresHeader?: string
        }
    }
}

// ─── API Response Wrapper ────────────────────────────────────────

type PassportApiResponse<T = unknown> = {
    status: boolean
    code: number
    message: string
    data?: T
}

// ─── Ticket Generate ─────────────────────────────────────────────

type AppGenerateTicketResponse = {
    ticket: string
    redirect_to: string
}

// ─── Ticket Redeem ───────────────────────────────────────────────

type AppTicketData = {
    app_id: string
    user_id?: string
    profile_id?: string
    introspect_token?: string
    redirect_url?: string
    expire_at: number
    is_processed: boolean
    allow_redeem: boolean
    redeemed_at?: number
}

type AppRedeemTicketResponse = {
    ticket_data: AppTicketData
}

// ─── Introspect Redeem ───────────────────────────────────────────

type AppIntrospectData = {
    app_id: string
    profile_id: string
    pairwised: boolean
    profile_name: string
    profile_role: string
    created_at: number
    expired_at: number
    is_rotate: boolean
    rotated_at: number | null
    need_rotate: boolean
}

type AppIntrospectRedeemResponse = {
    introspect_data: AppIntrospectData
    required_data: Record<string, unknown>
}

// ─── Introspect Rotate ───────────────────────────────────────────

type AppIntrospectRotateResponse = {
    introspect_token: string
}

// ─── Pairwise Resolve Email ──────────────────────────────────────

type AppPairwiseResolveEmailResponse = {
    email: string
}

declare class MIAOMCPassport {
    private PassportConfig;
    private passportService;
    constructor(config: MIAOMCPassportConfig);
    private standardizeConfig;
    /**
     * 生成 App Ticket
     * @param redirectUrl - 授权成功后的回调地址
     * @returns ticket 和 redirectTo（Passport 授权页地址）
     */
    generateTicket(redirectUrl: string): Promise<PassportApiResponse<AppGenerateTicketResponse>>;
    /**
     * 兑换 App Ticket
     * @param ticket - 从授权回调中获取的 ticket
     * @returns ticketData（包含 appId、userId、profileId、introspectToken 等）
     */
    redeemTicket(ticket: string): Promise<PassportApiResponse<AppRedeemTicketResponse>>;
    /**
     * 验证 Introspect Token 有效性
     * @param introspectToken - Introspect Token
     * @returns introspect_data 和 required_data
     */
    redeemIntrospect(introspectToken: string): Promise<PassportApiResponse<AppIntrospectRedeemResponse>>;
    /**
     * 轮换 Introspect Token
     * @param introspectToken - 当前的 Introspect Token
     * @returns 新的 introspect_token
     */
    rotateIntrospect(introspectToken: string): Promise<PassportApiResponse<AppIntrospectRotateResponse>>;
    /**
     * 通过 Pairwise ID 解析真实邮箱
     * @param pairwiseId - Pairwise 标识 ID（即 Introspect Token 中返回的 profileId）
     * @returns 解析后的真实邮箱地址
     */
    resolveEmail(pairwiseId: string): Promise<PassportApiResponse<AppPairwiseResolveEmailResponse>>;
}

export { type AppGenerateTicketResponse, type AppIntrospectData, type AppIntrospectRedeemResponse, type AppIntrospectRotateResponse, type AppPairwiseResolveEmailResponse, type AppRedeemTicketResponse, type AppTicketData, MIAOMCPassport, type MIAOMCPassportConfig, type PassportApiResponse };
