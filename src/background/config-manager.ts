import { readText } from './utils/network';
import { parseArray } from '../utils/text';
import { getDuration } from '../utils/time';
import { parseInversionFixes } from '../generators/css-filter';
import { parseDynamicThemeFixes } from '../generators/dynamic-theme';
import { parseStaticThemes } from '../generators/static-theme';
import { InversionFix, StaticTheme, DynamicThemeFix } from '../definitions';

const CONFIG_URLs = {
    darkSites: {
        local: '../config/dark-sites.config',
    },
    dynamicThemeFixes: {
        local: '../config/dynamic-theme-fixes.config',
    },
    inversionFixes: {
        local: '../config/inversion-fixes.config',
    },
    staticThemes: {
        local: '../config/static-themes.config',
    },
};
const REMOTE_TIMEOUT_MS = getDuration({ seconds: 10 });

export default class ConfigManager {
    DARK_SITES?: string[];
    DYNAMIC_THEME_FIXES?: DynamicThemeFix[];
    INVERSION_FIXES?: InversionFix[];
    STATIC_THEMES?: StaticTheme[];

    raw = {
        darkSites: null,
        dynamicThemeFixes: null,
        inversionFixes: null,
        staticThemes: null,
    };

    overrides = {
        darkSites: null,
        dynamicThemeFixes: null,
        inversionFixes: null,
        staticThemes: null,
    };

    private async loadConfig({
        name,
        local,
        localURL,
        success,
    }) {
        let $config: string;
        const loadLocal = async () => await readText({ url: localURL });
        $config = await loadLocal();
        success($config);
    }

    private async loadDarkSites({ local }) {
        await this.loadConfig({
            name: 'Dark Sites',
            local,
            localURL: CONFIG_URLs.darkSites.local,
            success: ($sites) => {
                this.raw.darkSites = $sites;
                this.handleDarkSites();
            },
        });
    }

    private async loadDynamicThemeFixes({ local }) {
        await this.loadConfig({
            name: 'Dynamic Theme Fixes',
            local,
            localURL: CONFIG_URLs.dynamicThemeFixes.local,
            success: ($fixes) => {
                this.raw.dynamicThemeFixes = $fixes;
                this.handleDynamicThemeFixes();
            },
        });
    }

    private async loadInversionFixes({ local }) {
        await this.loadConfig({
            name: 'Inversion Fixes',
            local,
            localURL: CONFIG_URLs.inversionFixes.local,
            success: ($fixes) => {
                this.raw.inversionFixes = $fixes;
                this.handleInversionFixes();
            },
        });
    }

    private async loadStaticThemes({ local }) {
        await this.loadConfig({
            name: 'Static Themes',
            local,
            localURL: CONFIG_URLs.staticThemes.local,
            success: ($themes) => {
                this.raw.staticThemes = $themes;
                this.handleStaticThemes();
            },
        });
    }

    async load(config: { local: boolean }) {
        await Promise.all([
            this.loadDarkSites(config),
            this.loadDynamicThemeFixes(config),
            this.loadInversionFixes(config),
            this.loadStaticThemes(config),
        ]).catch((err) => console.error('Fatality', err));
    }

    private handleDarkSites() {
        const $sites = this.overrides.darkSites || this.raw.darkSites;
        this.DARK_SITES = parseArray($sites);
    }

    handleDynamicThemeFixes() {
        const $fixes = this.overrides.dynamicThemeFixes || this.raw.dynamicThemeFixes;
        this.DYNAMIC_THEME_FIXES = parseDynamicThemeFixes($fixes);
    }

    handleInversionFixes() {
        const $fixes = this.overrides.inversionFixes || this.raw.inversionFixes;
        this.INVERSION_FIXES = parseInversionFixes($fixes);
    }

    handleStaticThemes() {
        const $themes = this.overrides.staticThemes || this.raw.staticThemes;
        this.STATIC_THEMES = parseStaticThemes($themes);
    }
}
