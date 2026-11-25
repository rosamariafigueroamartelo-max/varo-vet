import { createRouter, createWebHashHistory } from 'vue-router';

// Modo hash (#/servicios): la SPA funciona al recargar en GitHub Pages, Netlify o Vercel sin configurar redirecciones.
const routes = [
  { path: '/', name: 'inicio', component: () => import('@/views/InicioView.vue'), meta: { titulo: 'Inicio' } },
  { path: '/nosotros', name: 'nosotros', component: () => import('@/views/NosotrosView.vue'), meta: { titulo: 'Nosotros' } },
  { path: '/servicios', name: 'servicios', component: () => import('@/views/ServiciosView.vue'), meta: { titulo: 'Servicios' } },
  { path: '/servicios/:id', name: 'servicio-detalle', component: () => import('@/views/ServicioDetalleView.vue'), props: true, meta: { titulo: 'Detalle del servicio' } },
  { path: '/agendar-cita', name: 'agendar', component: () => import('@/views/AgendarCitaView.vue'), meta: { titulo: 'Agenda tu cita' } },
  { path: '/mis-citas', name: 'mis-citas', component: () => import('@/views/MisCitasView.vue'), meta: { titulo: 'Mis citas' } },
  { path: '/contacto', name: 'contacto', component: () => import('@/views/ContactoView.vue'), meta: { titulo: 'Contactos' } },
  { path: '/:pathMatch(.*)*', name: 'no-encontrada', component: () => import('@/views/NoEncontradaView.vue'), meta: { titulo: 'Página no encontrada' } }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
});

router.afterEach((to) => {
  document.title = `${to.meta.titulo} | VaRo Vet`;
});

export default router;
