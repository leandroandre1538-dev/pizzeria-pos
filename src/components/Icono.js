/**
 * Envoltorio unico para los iconos de Lucide.
 *
 * Todos los iconos pasan por aqui para que tengan el mismo tamano y grosor
 * (clases `.i`, `.i-chico`, `.i-grande`, `.i-xl` en globals.css) y queden
 * ocultos para los lectores de pantalla, ya que el texto al lado ya dice que
 * hace el boton.
 *
 * Uso: <Icono de={ShoppingBag} tamano="grande" />
 */
export default function Icono({ de: Componente, tamano }) {
  const clase = tamano ? `i i-${tamano}` : 'i';
  return (
    <span className={clase} aria-hidden="true">
      <Componente />
    </span>
  );
}
