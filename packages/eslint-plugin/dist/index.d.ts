import type { ESLint, Rule } from 'eslint';
export declare const rules: Record<string, Rule.RuleModule>;
declare const plugin: ESLint.Plugin;
export declare const configs: {
    recommended: {
        plugins: {
            '@huangjunsen': ESLint.Plugin;
        };
        rules: {
            '@huangjunsen/no-http-url': string;
            '@huangjunsen/no-secret-info': string;
        };
    };
    'legacy-recommended': {
        plugins: string[];
        rules: {
            '@huangjunsen/no-http-url': string;
            '@huangjunsen/no-secret-info': string;
        };
    };
};
export default plugin;
