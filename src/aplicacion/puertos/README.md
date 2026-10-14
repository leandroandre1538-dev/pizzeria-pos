# Puertos

Contratos que la capa de aplicacion necesita del mundo exterior.

Los casos de uso dependen **solo** de estas clases abstractas, nunca de
Supabase, Resend ni Next.js. La implementacion concreta se inyecta desde
`src/infraestructura/Contenedor.js` (inversion de dependencias).

Estan separados por responsabilidad en lugar de tener un unico repositorio
gigante: un caso de uso que solo necesita leer gastos no deberia arrastrar
metodos de pedidos, promociones y usuarios (segregacion de interfaces).

Para cambiar de base de datos o de proveedor de correo basta con escribir un
adaptador nuevo que cumpla el mismo contrato. Ninguna regla de negocio cambia.

| Puerto                       | Responsabilidad                                  |
|------------------------------|--------------------------------------------------|
| `RepositorioDePedidos`       | Guardar y leer pedidos del dia                   |
| `RepositorioDeGastos`        | Guardar y leer gastos del dia                    |
| `RepositorioDeCarta`         | Productos, presentaciones y adicionales          |
| `RepositorioDePromociones`   | Promociones y su vigencia                        |
| `RepositorioDeCierres`       | Cierre de caja de cada dia                       |
| `RepositorioDeUsuarios`      | Administradores y sus claves                     |
| `ServicioDeCorreo`           | Enviar el resumen al dueno                       |
| `Reloj`                      | Cual es "hoy" segun la hora de Peru              |
| `RegistroDeEnvios`           | Bitacora de los correos del job de medianoche    |
