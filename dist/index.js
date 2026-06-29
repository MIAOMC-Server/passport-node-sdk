import axios from 'axios';
import { randomUUID, createHmac } from 'crypto';

// src/service/request.service.ts
var SignatureService = class {
  appId;
  appSecret;
  constructor(config) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
  }
  /**
   * Generate HMAC-SHA256 signature for App Hook authentication.
   * @param body - Request body as Buffer
   * @param nonce - The same nonce that will be sent in the request header
   * @param expiredAt - Expiration timestamp in seconds
   */
  generateSignature(body, nonce, expiredAt) {
    const { appId, appSecret } = this;
    const dataToSign = `${appId}:${nonce}:${expiredAt}:${body}`;
    const calcSignature = createHmac("sha256", appSecret).update(dataToSign).digest("hex");
    return calcSignature;
  }
};

// src/service/request.service.ts
var RequestService = class {
  PassportConfig;
  signatureService;
  appIdHeader;
  appNonceHeader;
  appSignatureHeader;
  appSignatureExpiresHeader;
  constructor(config) {
    this.PassportConfig = config;
    this.signatureService = new SignatureService(config);
    this.appIdHeader = config.advancedConfig?.authorizationHeader?.appIdHeader || "x-miaomc-app-id";
    this.appNonceHeader = config.advancedConfig?.authorizationHeader?.appNonceHeader || "x-miaomc-app-nonce";
    this.appSignatureHeader = config.advancedConfig?.authorizationHeader?.appSignatureHeader || "x-miaomc-signature";
    this.appSignatureExpiresHeader = config.advancedConfig?.authorizationHeader?.appSignatureExpiresHeader || "x-miaomc-signature-expired-at";
  }
  /**
   * Send an authenticated request to the Passport API.
   */
  async sendRequest(method, expiresSeconds, url, options) {
    let finalUrl = this.PassportConfig.baseUrl;
    if (url.startsWith("/")) finalUrl += url;
    else finalUrl += `/${url}`;
    if (options?.query) {
      const params = new URLSearchParams(options.query);
      finalUrl += `?${params.toString()}`;
    }
    const nonce = randomUUID();
    const expiredAt = Math.floor(Date.now() / 1e3) + expiresSeconds;
    const bodyBuffer = Buffer.from(options?.body ? JSON.stringify(options.body) : "");
    const signature = this.signatureService.generateSignature(bodyBuffer, nonce, expiredAt);
    const requestHeaders = {
      [this.appIdHeader]: this.PassportConfig.appId,
      [this.appNonceHeader]: nonce,
      [this.appSignatureHeader]: signature,
      [this.appSignatureExpiresHeader]: expiredAt
    };
    if (options?.introspectToken) {
      requestHeaders["x-miaomc-introspect"] = options.introspectToken;
    }
    const response = await axios({
      headers: requestHeaders,
      method,
      url: finalUrl,
      data: method === "POST" ? options?.body : void 0
    });
    return response.data;
  }
};

// src/service/passport.service.ts
var DEFAULT_EXPIRES_SECONDS = 30;
var PassportService = class {
  requestService;
  constructor(config) {
    this.requestService = new RequestService(config);
  }
  /**
   * 生成 App Ticket
   * POST /api/v1/app/ticket/generate
   * @param redirectUrl - 授权成功后的回调地址
   */
  async generateTicket(redirectUrl) {
    return this.requestService.sendRequest(
      "POST",
      DEFAULT_EXPIRES_SECONDS,
      "/app/ticket/generate",
      { body: { redirect_url: redirectUrl } }
    );
  }
  /**
   * 兑换 App Ticket
   * POST /api/v1/app/ticket/redeem
   * @param ticket - 从授权回调中获取的 ticket
   */
  async redeemTicket(ticket) {
    return this.requestService.sendRequest(
      "POST",
      DEFAULT_EXPIRES_SECONDS,
      "/app/ticket/redeem",
      { body: { ticket } }
    );
  }
  /**
   * 验证 Introspect Token 有效性
   * GET /api/v1/app/introspect/redeem
   * @param introspectToken - Introspect Token
   */
  async redeemIntrospect(introspectToken) {
    return this.requestService.sendRequest(
      "GET",
      DEFAULT_EXPIRES_SECONDS,
      "/app/introspect/redeem",
      { introspectToken }
    );
  }
  /**
   * 轮换 Introspect Token
   * POST /api/v1/app/introspect/rotate
   * @param introspectToken - 当前的 Introspect Token
   */
  async rotateIntrospect(introspectToken) {
    return this.requestService.sendRequest(
      "POST",
      DEFAULT_EXPIRES_SECONDS,
      "/app/introspect/rotate",
      { introspectToken }
    );
  }
  /**
   * 通过 Pairwise ID 解析真实邮箱
   * GET /api/v1/app/pairwise/resolve-email
   * @param pairwiseId - Pairwise 标识 ID（即 Introspect Token 中返回的 profileId）
   */
  async resolveEmail(pairwiseId) {
    return this.requestService.sendRequest(
      "GET",
      DEFAULT_EXPIRES_SECONDS,
      "/app/pairwise/resolve-email",
      { query: { pairwise_id: pairwiseId } }
    );
  }
};

// src/index.ts
var MIAOMCPassport = class {
  PassportConfig;
  passportService;
  constructor(config) {
    this.PassportConfig = this.standardizeConfig(config);
    this.passportService = new PassportService(this.PassportConfig);
  }
  standardizeConfig(config) {
    const standardizedConfig = {
      appId: config.appId,
      appSecret: config.appSecret,
      baseUrl: config.baseUrl || "https://passport.miaomc.com/api/v1",
      advancedConfig: {
        authorizationHeader: {
          appIdHeader: config.advancedConfig?.authorizationHeader?.appIdHeader || "x-miaomc-app-id",
          appNonceHeader: config.advancedConfig?.authorizationHeader?.appNonceHeader || "x-miaomc-app-nonce",
          appSignatureHeader: config.advancedConfig?.authorizationHeader?.appSignatureHeader || "x-miaomc-signature",
          appSignatureExpiresHeader: config.advancedConfig?.authorizationHeader?.appSignatureExpiresHeader || "x-miaomc-signature-expired-at"
        }
      }
    };
    return standardizedConfig;
  }
  // ─── Ticket ──────────────────────────────────────────────────
  /**
   * 生成 App Ticket
   * @param redirectUrl - 授权成功后的回调地址
   * @returns ticket 和 redirectTo（Passport 授权页地址）
   */
  async generateTicket(redirectUrl) {
    return this.passportService.generateTicket(redirectUrl);
  }
  /**
   * 兑换 App Ticket
   * @param ticket - 从授权回调中获取的 ticket
   * @returns ticketData（包含 appId、userId、profileId、introspectToken 等）
   */
  async redeemTicket(ticket) {
    return this.passportService.redeemTicket(ticket);
  }
  // ─── Introspect ──────────────────────────────────────────────
  /**
   * 验证 Introspect Token 有效性
   * @param introspectToken - Introspect Token
   * @returns introspect_data 和 required_data
   */
  async redeemIntrospect(introspectToken) {
    return this.passportService.redeemIntrospect(introspectToken);
  }
  /**
   * 轮换 Introspect Token
   * @param introspectToken - 当前的 Introspect Token
   * @returns 新的 introspect_token
   */
  async rotateIntrospect(introspectToken) {
    return this.passportService.rotateIntrospect(introspectToken);
  }
  // ─── Pairwise ────────────────────────────────────────────────
  /**
   * 通过 Pairwise ID 解析真实邮箱
   * @param pairwiseId - Pairwise 标识 ID（即 Introspect Token 中返回的 profileId）
   * @returns 解析后的真实邮箱地址
   */
  async resolveEmail(pairwiseId) {
    return this.passportService.resolveEmail(pairwiseId);
  }
};

export { MIAOMCPassport };
