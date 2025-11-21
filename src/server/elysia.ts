import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { dashboardRoutes } from './routes/dashboard'
import { tasksRoutes } from './routes/tasks'
import { uploadRoutes } from './routes/upload'
import { feedersRoutes } from './routes/feeders'
import { stationsRoutes } from './routes/stations'
import { jobTypesRoutes } from './routes/job-types'
import { operationCentersRoutes } from './routes/operation-centers'
import { teamsRoutes } from './routes/teams'
import { peasRoutes } from './routes/peas'
import { jobDetailsRoutes } from './routes/job-details'

export const app = new Elysia({ prefix: '/api' })
    .use(cors())
    .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
    .get('/', () => 'Hello from Elysia inside Next.js!')
    .use(dashboardRoutes)
    .use(tasksRoutes)
    .use(uploadRoutes)
    .use(feedersRoutes)
    .use(stationsRoutes)
    .use(jobTypesRoutes)
    .use(operationCentersRoutes)
    .use(teamsRoutes)
    .use(peasRoutes)
    .use(jobDetailsRoutes)



export type App = typeof app
