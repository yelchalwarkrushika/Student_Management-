import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
	{ ignores: ['dist/**', 'node_modules/**'] },
	js.configs.recommended,
	{
		files: ['src/**/*.{js,jsx}', 'tests/**/*.{js,jsx}', 'scripts/**/*.js', 'vite.config.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: { ...globals.browser, ...globals.node },
			parserOptions: { ecmaFeatures: { jsx: true } },
		},
		plugins: { react, 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
		rules: {
			...reactHooks.configs.flat.recommended.rules,
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'react/jsx-uses-vars': 'error',
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		},
	},
];
