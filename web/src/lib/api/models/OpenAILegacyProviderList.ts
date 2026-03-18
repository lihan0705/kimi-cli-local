import { type OpenAILegacyProviderInfo, OpenAILegacyProviderInfoFromJSON } from './OpenAILegacyProviderInfo';

export interface OpenAILegacyProviderList {
    providers: Array<OpenAILegacyProviderInfo>;
}

export function OpenAILegacyProviderListFromJSON(json: any): OpenAILegacyProviderList {
    return {
        'providers': ((json['providers'] as Array<any>).map(OpenAILegacyProviderInfoFromJSON)),
    };
}
