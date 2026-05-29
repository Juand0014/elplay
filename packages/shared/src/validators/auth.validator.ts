import { z } from 'zod'

export const LoginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export const RegisterSchema = z.object({
  nombre:          z.string().min(2, 'Nombre muy corto').max(100),
  email:           z.string().email('Email inválido'),
  password:        z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] }
)

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export type LoginInput           = z.infer<typeof LoginSchema>
export type RegisterInput        = z.infer<typeof RegisterSchema>
export type ForgotPasswordInput  = z.infer<typeof ForgotPasswordSchema>
