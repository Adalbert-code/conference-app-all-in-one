/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: true,
  output: 'standalone', //-> this is to get a server for nodejs
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/agenda',
  //       destination: 'http://frontend.default.74.220.17.154.sslip.io/api/agenda/',
  //     },
  //     {
  //         source: '/api/agenda/:path*',
  //         destination: 'http://frontend.default.74.220.17.154.sslip.io/api/agenda/:path*',
  //     },
  //     {
  //         source: '/api/c4p',
  //         destination: 'http://frontend.default.74.220.17.154.sslip.io/api/c4p/',
  //     },
  //     {
  //         source: '/api/c4p/:path*',
  //         destination: 'http://frontend.default.74.220.17.154.sslip.io/api/c4p/:path*',
  //     },
  //     {
  //       source: '/api/events',
  //       destination: 'http://frontend.default.74.220.17.154.sslip.io/api/events/',
  //     },
  //     {
  //       source: '/api/events/:path*',
  //       destination: 'http://frontend.default.74.220.17.154.sslip.io/api/events/:path*',
  //     },
  //     {
  //       source: '/api/notifications',
  //       destination: 'http://frontend.default.74.220.17.154.sslip.io/api/notifications/',
  //     },
  //     {
  //       source: '/api/notifications/:path*',
  //       destination: 'http://frontend.default.74.220.17.154.sslip.io/api/notifications/:path*',
  //     },
  //     {
  //       source: '/service/info',
  //       destination: 'http://frontend.default.74.220.17.154.sslip.io/service/info',
  //     },
  //     {
  //       source: '/api/features',
  //       destination: 'http://frontend.default.74.220.17.154.sslip.io/api/features/',
  //     },
  //   ]
  // },
}