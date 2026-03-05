import globals from 'globals';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import css from '@eslint/css';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    { files: ['**/*.js'], languageOptions: { sourceType: 'script' } },
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: { globals: globals.browser },
    },
    { files: ['**/*.json'], plugins: { json }, language: 'json/json' },
    { files: ['**/*.md'], plugins: { markdown }, language: 'markdown/gfm' },
    { files: ['**/*.css'], plugins: { css }, language: 'css/css' },
    {
        files: ['**/*.{js,mjs,cjs}'],
        extends: [eslintConfigPrettier],
        plugins: { prettier: eslintPluginPrettier },
        rules: {
            'prettier/prettier': ['warn'],
        },
    },
]);
