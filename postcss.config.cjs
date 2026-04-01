module.exports = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        /* Mobile first */
        'mantine-breakpoint-xs': '30em', // 480px → mobile kecil–normal
        'mantine-breakpoint-sm': '48em', // 768px → tablet / mobile landscape
        'mantine-breakpoint-md': '64em', // 1024px → laptop & desktop kecil
        'mantine-breakpoint-lg': '80em', // 1280px → desktop standar
        'mantine-breakpoint-xl': '90em', // 1440px+ → desktop besar
      },
    },
  },
};
