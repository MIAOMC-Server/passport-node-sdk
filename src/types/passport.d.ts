// ─── Config ──────────────────────────────────────────────────────

export type MIAOMCPassportConfig = {
    appId: string
    appSecret: string
    baseUrl?: string

    advancedConfig?: {
        authorizationHeader?: {
            appIdHeader?: string
            appNonceHeader?: string
            appSignatureHeader?: string
            appSignatureExpiresHeader?: string
            appIntrospectTokenHeader?: string
        }
    }
}

// ─── API Response Wrapper ────────────────────────────────────────

export type PassportApiResponse<T = unknown> = {
    status: boolean
    code: number
    message: string
    data?: T
}

// ─── Ticket Generate ─────────────────────────────────────────────

export type AppGenerateTicketResponse = {
    ticket: string
    redirect_to: string
}

// ─── Ticket Redeem ───────────────────────────────────────────────

export type AppTicketData = {
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

export type AppRedeemTicketResponse = {
    ticket_data: AppTicketData
}

// ─── Introspect Redeem ───────────────────────────────────────────

export type AppIntrospectData = {
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

export type AppIntrospectRedeemResponse = {
    introspect_data: AppIntrospectData
    required_data: Record<string, unknown>
}

// ─── Introspect Rotate ───────────────────────────────────────────

export type AppIntrospectRotateResponse = {
    introspect_token: string
}

// ─── Pairwise Resolve Email ──────────────────────────────────────

export type AppPairwiseResolveEmailResponse = {
    email: string
}
