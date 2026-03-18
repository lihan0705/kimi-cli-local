export interface OpenAILegacyProviderInfo {
    name: string;
    baseUrl: string;
    hasApiKey: boolean;
}

export function OpenAILegacyProviderInfoFromJSON(json: any): OpenAILegacyProviderInfo {
    return {
        'name': json['name'],
        'baseUrl': json['base_url'],
        'hasApiKey': json['has_api_key'],
    };
}
