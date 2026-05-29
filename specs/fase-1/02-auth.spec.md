# Spec 02 — Autenticación
> Fase 1 · Depende de: Spec 01 (monorepo + schema + tipos listos)

## Objetivo
Implementar el flujo completo de autenticación con Supabase Auth,
manejo de roles y sesión persistente en React Native.

## Pantallas

### `app/(auth)/login.tsx`
- Campo email + campo password
- Botón "Entrar"
- Link "¿No tienes cuenta? Regístrate"
- Manejo de error: credenciales inválidas
- Loading state mientras hace request
- Al login exitoso → redirect a `/(tabs)/`

### `app/(auth)/register.tsx`
- Campo nombre completo
- Campo email
- Campo password (mínimo 8 caracteres)
- Campo confirmar password
- Botón "Crear cuenta"
- Link "¿Ya tienes cuenta? Entra"
- Al registro exitoso → redirect a `/(tabs)/`

### `app/(auth)/forgot-password.tsx`
- Campo email
- Botón "Enviar enlace"
- Mensaje de confirmación cuando se envía

## Lógica

### `store/auth.store.ts`
```typescript
interface AuthStore {
  user:        User | null
  session:     Session | null
  role:        RolUsuario | null
  isLoading:   boolean
  isHydrated:  boolean

  // Actions
  signIn:      (email: string, password: string) => Promise<void>
  signUp:      (email: string, password: string, nombre: string) => Promise<void>
  signOut:     () => Promise<void>
  hydrate:     () => Promise<void>   // restaurar sesión desde SecureStore
}
```

### `hooks/use-auth.ts`
- Wrapper sobre el store
- Expone `user`, `role`, `isLoading`
- Expone `signIn`, `signUp`, `signOut`

### `hooks/use-require-auth.ts`
- Redirige a login si no hay sesión activa
- Usar en pantallas protegidas

### `hooks/use-require-role.ts`
```typescript
// Redirige si el usuario no tiene el rol requerido
useRequireRole(RolUsuario.DuenoEquipo)
```

### Sesión persistente
- Guardar token con `expo-secure-store`
- Restaurar sesión al abrir la app (en `_layout.tsx` raíz)
- Manejar token expirado → redirect a login automático

### Supabase Auth helpers
```typescript
// lib/supabase.ts
// Cliente configurado con SecureStore para persistencia
// Escuchar onAuthStateChange para sincronizar el store
```

## Validaciones (Zod)

```typescript
// Usar los schemas del packages/shared
const LoginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

const RegisterSchema = z.object({
  nombre:           z.string().min(2, 'Nombre muy corto'),
  email:            z.string().email('Email inválido'),
  password:         z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword:  z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] }
)
```

## Criterios de aceptación

- [ ] Login con email/password funciona
- [ ] Registro crea usuario en Supabase Auth y en tabla `perfiles`
- [ ] Al cerrar y reabrir la app, la sesión se restaura
- [ ] Token expirado redirige a login automáticamente
- [ ] Errores de Supabase se muestran en UI (no en consola)
- [ ] Loading states en todos los botones de acción
- [ ] No hay `any` en TypeScript
- [ ] Formularios usan Zod para validación
- [ ] `useRequireAuth` redirige correctamente en pantallas protegidas

## Notas para Claude Code

- Usar `expo-secure-store` para persistencia, no AsyncStorage
- Los roles se guardan en tabla `roles_usuario` del schema (Spec 01)
- Al registrarse, el rol por defecto es `RolUsuario.Publico`
  hasta que se asigne a un equipo o liga
- Usar `react-hook-form` + Zod para los formularios
- Todos los strings de UI en español, código en inglés
