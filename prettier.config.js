//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  tailwindStylesheet: './src/styles.css',
  tailwindFunctions: ['clsx'],
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
