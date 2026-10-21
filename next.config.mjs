/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deploy dedicado a um formulário: defina ROOT_REDIRECT=/gsc para a raiz abrir direto nele.
  async redirects() {
    const to = process.env.ROOT_REDIRECT;
    return to ? [{ source: "/", destination: to, permanent: false }] : [];
  },
};
export default nextConfig;
