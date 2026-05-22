import { getTwistBaseUri } from '../consts/endpoints'
import type { ApiVersion } from '../types/api-version'
import { DEFAULT_API_VERSION } from '../types/api-version'
import type { CustomFetch } from '../types/http'

export type ClientConfig = {
    /** API token for authentication */
    apiToken: string
    /** Optional custom base URL. If not provided, uses the default Twist API URL */
    baseUrl?: string
    /** Optional API version. Defaults to 'v3' */
    version?: ApiVersion
    /** Optional custom fetch implementation for cross-platform compatibility */
    customFetch?: CustomFetch
}

/**
 * Base client class that provides centralized URL management and configuration
 * for all Twist API clients. Fixes the trailing slash bug and eliminates code duplication.
 */
export class BaseClient {
    protected readonly apiToken: string
    protected readonly baseUrl?: string
    protected readonly defaultVersion: ApiVersion
    protected readonly customFetch?: CustomFetch

    constructor(config: ClientConfig) {
        this.apiToken = config.apiToken
        this.baseUrl = config.baseUrl
        this.defaultVersion = config.version || DEFAULT_API_VERSION
        this.customFetch = config.customFetch
    }

    /**
     * Gets the base URI for API requests with proper trailing slash handling.
     * This method fixes the trailing slash bug that occurred when using custom baseUrl.
     *
     * @param version - Optional API version override. Defaults to the configured version or 'v3'
     * @returns Base URI with guaranteed trailing slash for proper URL resolution
     */
    protected getBaseUri(version?: ApiVersion): string {
        const apiVersion = version || this.defaultVersion

        if (this.baseUrl) {
            // Ensure trailing slash to fix URL resolution bug
            const normalizedBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`
            return `${normalizedBaseUrl}api/${apiVersion}/`
        }

        // Use centralized helper function for default Twist API URL
        return getTwistBaseUri(apiVersion)
    }

    /**
     * Gets the base URL used to build entity web links (the `url` field on returned
     * entities). Honors the configured `baseUrl` as-is, falling back to the production
     * web app when none is set.
     *
     * @returns Link base URL without a trailing slash (entity paths already start with `/`)
     */
    protected getLinkBaseUrl(): string {
        if (!this.baseUrl) {
            return 'https://twist.com'
        }
        // Strip a trailing slash so links don't end up with a double slash, since
        // entity paths from getTwistURL always begin with '/'.
        return this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl
    }
}
