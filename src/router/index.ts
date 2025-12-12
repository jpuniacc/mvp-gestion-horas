import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    redirect: '/timesheet/week',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/timesheet',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'week/:year?/:week?',
        name: 'timesheet-week',
        component: () => import('@/views/TimesheetWeekView.vue'),
      },
    ],
  }, {
    path: '/approvals',
    name: 'approvals',
    component: () => import('@/views/ApprovalsView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'pm', 'ops'] },
  },

  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UsersView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'pm', 'ops'] },
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'pm', 'ops'] },
  },
  {
    path: '/empresas',
    name: 'empresas',
    component: () => import('@/views/EmpresasView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'pm', 'ops'] },
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/views/ReportsView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'pm', 'ops'] },
  },
  {
    path: '/reportsCost',
    name: 'reportsCost',
    component: () => import('@/views/ReportsCost.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'pm', 'ops'] },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth if not already done
  if (!authStore.user && authStore.loading === false) {
    await authStore.initialize()
  }

  if (to.meta.requiresAuth && !authStore.user) {
    return next('/login')
  }

  if (to.meta.roles && authStore.profile) {
    const userRole = authStore.profile.role
    const allowedRoles = to.meta.roles as string[]
    if (!allowedRoles.includes(userRole)) {
      return next('/')
    }
  }

  next()
})

export default router

