export interface AddOpenAILegacyProviderRequest {
    name: string;
    baseUrl: string;
    apiKey?: string | null;
}

export function AddOpenAILegacyProviderRequestToJSON(value?: AddOpenAILegacyProviderRequest | null): any {
    if (value == null) {
        return value;
    }
    return {
        'name': value.name,
        'base_url': value.baseUrl,
        'api_key': value.apiKey,
    };
}
