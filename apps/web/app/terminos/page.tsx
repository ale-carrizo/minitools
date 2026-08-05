import type { Metadata } from "next";
import LegalPageLayout from "../components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Términos y Condiciones — Zimple Tools",
  description: "Términos y condiciones de uso de Zimple Tools conforme legislación argentina.",
};

export default function TerminosPage() {
  return (
    <LegalPageLayout
      eyebrow="Términos"
      title="Términos y Condiciones"
      updatedAt="5 de agosto de 2026"
      intro={[
        "Estos Términos y Condiciones regulan el acceso, navegación, registro, contratación y uso de Zimple Tools a través del sitio web, la aplicación y cualquier otro canal digital habilitado.",
        "La utilización del servicio implica la aceptación de estos términos, de la Política de Privacidad y de toda otra condición particular que pueda informarse para funcionalidades, promociones o integraciones específicas.",
      ]}
      sections={[
        {
          title: "1. Identificación del proveedor",
          paragraphs: [
            "Zimple Tools es un servicio prestado por [RAZÓN SOCIAL / NOMBRE], CUIT [CUIT], con domicilio legal en [DOMICILIO LEGAL], República Argentina.",
            "Canal de contacto legal y de soporte: [EMAIL LEGAL / SOPORTE].",
          ],
        },
        {
          title: "2. Descripción del servicio",
          paragraphs: [
            "Zimple Tools ofrece herramientas digitales orientadas a la gestión comercial, administrativa y operativa de negocios. La plataforma funciona bajo un esquema modular: cada usuario puede utilizar una o varias apps según sus necesidades, sin obligación de emplear la totalidad de los módulos disponibles.",
            "Las funcionalidades, características, precios, integraciones y disponibilidad de cada app pueden variar con el tiempo.",
          ],
        },
        {
          title: "3. Requisitos de uso y cuenta",
          bullets: [
            "Para acceder a determinadas funcionalidades puede requerirse registro de usuario y creación de cuenta.",
            "El usuario debe proporcionar información veraz, completa y actualizada.",
            "El usuario es responsable por la confidencialidad de sus credenciales y por toda actividad realizada desde su cuenta, salvo prueba de uso no autorizado ajeno a su control.",
            "No se permite utilizar la plataforma para actividades ilícitas, engañosas, abusivas o que vulneren derechos de terceros.",
          ],
        },
        {
          title: "4. Contratación, pruebas y suscripciones",
          paragraphs: [
            "Zimple Tools podrá ofrecer períodos de prueba, planes pagos, suscripciones recurrentes, promociones o condiciones comerciales específicas. Salvo indicación expresa en contrario, las pruebas gratuitas no implican obligación de compra hasta el vencimiento del plazo informado y la posterior confirmación de contratación o continuidad bajo el esquema definido por la oferta aplicable.",
            "Los precios, moneda, periodicidad de cobro, impuestos y condiciones relevantes de contratación deberán informarse de manera clara, suficiente, veraz y fácilmente accesible antes de la formalización de la operación.",
          ],
        },
        {
          title: "5. Medios de pago, renovaciones y facturación",
          paragraphs: [
            "Los pagos pueden ser procesados por terceros especializados. El usuario autoriza los cargos que correspondan según el plan seleccionado, su periodicidad y las condiciones informadas al momento de contratar.",
            "Cuando la contratación prevea renovación automática, dicha modalidad deberá surgir de manera clara de la oferta y/o del resumen previo a la confirmación. El usuario podrá solicitar la baja de la renovación conforme los mecanismos puestos a disposición en la plataforma o por soporte, sin perjuicio de las obligaciones devengadas hasta la fecha efectiva de baja.",
          ],
        },
        {
          title: "6. Derecho de información y contratación electrónica",
          paragraphs: [
            "En las contrataciones celebradas por medios electrónicos, Zimple Tools procurará cumplir con los estándares de información clara, suficiente, veraz y fácilmente accesible previstos por la normativa argentina de defensa del consumidor y comercio electrónico.",
            "Los términos de la contratación deberán poder leerse y conservarse por el usuario. Antes de la confirmación final, el usuario deberá contar con medios razonables para revisar los datos ingresados y corregir eventuales errores.",
          ],
        },
        {
          title: "7. Derecho de revocación o arrepentimiento",
          paragraphs: [
            "Cuando resulte aplicable conforme la normativa de defensa del consumidor y en los contratos celebrados a distancia, el usuario consumidor podrá ejercer su derecho de revocar la aceptación dentro del plazo legal correspondiente, salvo los supuestos de excepción previstos por la normativa vigente.",
            "Si por la modalidad de contratación correspondiera implementar un botón de arrepentimiento u otro mecanismo específico exigido por la regulación aplicable, Zimple Tools deberá ponerlo a disposición en forma visible y accesible.",
          ],
        },
        {
          title: "8. Uso permitido y restricciones",
          bullets: [
            "No está permitido copiar, modificar, descompilar, intentar vulnerar, extraer bases de datos, introducir malware o afectar la seguridad, integridad o disponibilidad del servicio.",
            "No está permitido usar Zimple Tools para infringir derechos de propiedad intelectual, normas de protección de datos, defensa del consumidor, normas tributarias o cualquier otra legislación aplicable.",
            "Nos reservamos la facultad de suspender o cancelar cuentas frente a incumplimientos graves, uso abusivo, riesgo de seguridad, requerimientos legales o falta de pago, en la medida permitida por la normativa aplicable.",
          ],
        },
        {
          title: "9. Contenido del usuario",
          paragraphs: [
            "El usuario conserva la titularidad sobre los datos, documentos y contenidos que cargue en la plataforma. Sin embargo, otorga a Zimple Tools las autorizaciones necesarias para alojarlos, procesarlos, reproducirlos técnicamente y utilizarlos en la medida indispensable para prestar el servicio contratado.",
            "El usuario declara contar con las autorizaciones y bases legales necesarias para cargar y tratar datos de terceros dentro de las apps que utilice.",
          ],
        },
        {
          title: "10. Propiedad intelectual",
          paragraphs: [
            "El software, diseño, marcas, logos, textos, desarrollos, documentación, bases estructurales, interfaces y demás elementos de Zimple Tools se encuentran protegidos por la normativa de propiedad intelectual y pertenecen a su titular o a terceros licenciantes.",
            "Estos términos no transfieren al usuario derechos de propiedad sobre la plataforma, más allá del permiso limitado, revocable, no exclusivo e intransferible de uso conforme a estas condiciones.",
          ],
        },
        {
          title: "11. Disponibilidad, cambios y mantenimiento",
          paragraphs: [
            "Zimple Tools podrá realizar actualizaciones, mejoras, cambios de diseño, tareas de mantenimiento, correcciones o adaptaciones regulatorias. En la medida razonable, se procurará minimizar interrupciones y comunicar incidencias relevantes cuando corresponda.",
            "No garantizamos que el servicio esté disponible sin interrupciones ni errores en todo momento, especialmente cuando dependan de terceros, integraciones externas, conectividad, infraestructura o eventos fuera del control razonable del proveedor.",
          ],
        },
        {
          title: "12. Limitación de responsabilidad",
          paragraphs: [
            "En la máxima medida permitida por la ley aplicable, Zimple Tools no será responsable por daños indirectos, lucro cesante, pérdida de chance, pérdida de datos o daños derivados del uso inadecuado del servicio, de información cargada por los usuarios, de caídas de terceros o de eventos ajenos a su control razonable.",
            "Nada de lo aquí dispuesto limita derechos irrenunciables de los consumidores ni excluye responsabilidad en los supuestos en que la legislación argentina impida hacerlo.",
          ],
        },
        {
          title: "13. Protección de datos personales",
          paragraphs: [
            "El tratamiento de datos personales se rige además por la Política de Privacidad de Zimple Tools, que forma parte integrante de estos Términos y Condiciones.",
          ],
        },
        {
          title: "14. Reclamos y atención al usuario",
          paragraphs: [
            "Zimple Tools procurará brindar canales razonables y eficientes para consultas, soporte y reclamos. Las comunicaciones podrán cursarse a través de la plataforma o a [EMAIL LEGAL / SOPORTE].",
            "Si el usuario reviste carácter de consumidor conforme la Ley N° 24.240, conserva todos los derechos reconocidos por la normativa de defensa del consumidor.",
          ],
        },
        {
          title: "15. Ley aplicable y jurisdicción",
          paragraphs: [
            "Estos Términos se interpretan conforme a las leyes de la República Argentina.",
            "En relaciones de consumo, serán competentes los tribunales que correspondan según la normativa de protección de consumidores y usuarios, sin que pueda privarse al consumidor de las competencias más favorables que la ley le reconozca.",
            "En supuestos no regidos por normativa de consumo ni por jurisdicción imperativa, las partes podrán someterse a los tribunales ordinarios con asiento en la Ciudad Autónoma de Buenos Aires.",
          ],
        },
        {
          title: "16. Modificaciones",
          paragraphs: [
            "Zimple Tools podrá modificar estos Términos y Condiciones por razones legales, regulatorias, operativas, comerciales o técnicas. La versión vigente será la publicada en el sitio. Cuando corresponda por la naturaleza del cambio, se podrán comunicar las modificaciones por medios razonables antes de su entrada en vigencia.",
          ],
        },
      ]}
    />
  );
}
