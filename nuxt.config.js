// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-04-03',
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    // '@nuxtjs/supabase', // Vô hiệu hóa Supabase vì chúng ta sử dụng PostgreSQL trực tiếp
  ],
  // Vô hiệu hóa config Supabase
  // supabase: {
  //   redirect: false,
  //   cookieOptions: {
  //     secure: process.env.NODE_ENV === 'production'
  //   }
  // },
  runtimeConfig: {
    public: {
      dbUrl: process.env.DATABASE_URL
    }
  },
  app: {
    head: {
      title: 'Bill Splitter App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'An app to calculate and split bills among friends' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap' }
      ]
    }
  },
  css: [
    '@/assets/css/main.css'
  ],
  ssr: false, // Disable server-side rendering since we're using client-side only
  vite: {
    server: {
      host: '0.0.0.0',
      port: 5000,
    }
  },
  // Configure the server to listen on all interfaces
  nitro: {
    preset: 'node-server',
    port: 5000,
    host: '0.0.0.0'
  }
})
