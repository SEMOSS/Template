// PostCSS config — processes Tailwind CSS directives and adds vendor prefixes.
// Tailwind v4 uses @tailwindcss/postcss instead of the older tailwindcss plugin.
module.exports = {
	plugins: {
		"@tailwindcss/postcss": {},
		autoprefixer: {},
	},
};
