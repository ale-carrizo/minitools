import type { Metadata } from "next";
import LegalPageLayout from "../components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Política de Privacidad — Zimple Tools",
  description: "Política de privacidad y tratamiento de datos personales conforme legislación argentina.",
};

export default function PrivacidadPage() {
  return (
    <LegalPageLayout
      eyebrow="Privacidad"
      title="Política de Privacidad"
      updatedAt="5 de agosto de 2026"
      intro={[
        "Esta Política de Privacidad describe cómo Zimple Tools trata los datos personales de quienes visitan el sitio, crean una cuenta, contratan o utilizan los servicios disponibles en la plataforma web y la aplicación.",
        "El tratamiento de datos personales se realiza de conformidad con la Ley N° 25.326 de Protección de los Datos Personales, su reglamentación, normas complementarias y demás legislación argentina aplicable.",
      ]}
      sections={[
        {
          title: "1. Responsable del tratamiento",
          paragraphs: [
            "El responsable de la base de datos y del tratamiento de la información es [RAZÓN SOCIAL / NOMBRE], CUIT [CUIT], con domicilio legal en [DOMICILIO LEGAL], República Argentina, titular de Zimple Tools.",
            "Para consultas vinculadas con privacidad o protección de datos personales, podés escribir a [EMAIL LEGAL / SOPORTE].",
          ],
        },
        {
          title: "2. Datos que podemos recopilar",
          bullets: [
            "Datos identificatorios y de contacto: nombre, apellido, email, teléfono, CUIT, razón social, domicilio u otros datos que ingreses al registrarte o configurar tu cuenta.",
            "Datos comerciales u operativos que cargues en la plataforma: clientes, productos, presupuestos, comprobantes, recibos, turnos, documentos, tareas, facturas y demás contenido funcional de las apps que utilices.",
            "Datos de pago y facturación: método de pago, información de suscripción, historial de cobros y datos relacionados con procesadores externos de pago.",
            "Datos técnicos y de uso: dirección IP, identificadores de sesión, información del dispositivo, navegador, fechas, horas, registros de actividad, errores y métricas de uso.",
            "Comunicaciones con soporte o canales de contacto: consultas, reclamos, solicitudes y archivos que nos envíes.",
          ],
        },
        {
          title: "3. Finalidades del tratamiento",
          bullets: [
            "Crear y administrar tu cuenta de usuario.",
            "Prestar, mantener y mejorar las funcionalidades contratadas o utilizadas dentro de Zimple Tools.",
            "Procesar suscripciones, cobros, renovaciones, facturación y gestiones administrativas asociadas.",
            "Brindar soporte técnico, responder consultas y gestionar incidencias o reclamos.",
            "Enviar comunicaciones operativas, de seguridad, legales o vinculadas al servicio.",
            "Prevenir fraudes, abusos, accesos no autorizados y otros riesgos de seguridad.",
            "Cumplir obligaciones legales, regulatorias, fiscales, contables y requerimientos de autoridad competente.",
            "Realizar estadísticas, análisis agregados o métricas internas para mejorar la plataforma, procurando minimizar la identificación directa cuando resulte razonable.",
          ],
        },
        {
          title: "4. Base jurídica",
          paragraphs: [
            "Tratamos tus datos personales en la medida en que ello sea necesario para ejecutar la relación contractual o precontractual con vos, para cumplir obligaciones legales y regulatorias, para proteger intereses legítimos vinculados con la operación, seguridad y mejora del servicio, y cuando corresponda sobre la base de tu consentimiento.",
            "Cuando el tratamiento se funde en el consentimiento, podrás revocarlo en cualquier momento, sin efecto retroactivo, conforme a la normativa aplicable.",
          ],
        },
        {
          title: "5. Con quién podemos compartir datos",
          bullets: [
            "Proveedores tecnológicos que prestan servicios a Zimple Tools, por ejemplo hosting, infraestructura, almacenamiento, autenticación, analítica, correo, mensajería, procesamiento de pagos o soporte.",
            "Procesadores o pasarelas de pago para gestionar suscripciones, cobros o validaciones vinculadas con medios de pago.",
            "Profesionales, asesores o auditores sujetos a deberes de confidencialidad.",
            "Autoridades administrativas, judiciales, fiscales o regulatorias cuando exista obligación legal o requerimiento válido.",
            "Terceros involucrados en reorganizaciones societarias, fusiones, adquisiciones o cesiones, bajo las garantías legales y contractuales correspondientes.",
          ],
          paragraphs: [
            "Zimple Tools no vende datos personales como negocio propio. Cuando compartimos información con terceros, lo hacemos en la medida necesaria para la finalidad correspondiente y bajo compromisos de confidencialidad y seguridad.",
          ],
        },
        {
          title: "6. Transferencias internacionales",
          paragraphs: [
            "Algunos proveedores tecnológicos pueden almacenar o procesar información en servidores ubicados fuera de la República Argentina. En esos casos, Zimple Tools procurará que dichas transferencias cuenten con bases legales adecuadas y con medidas contractuales, organizativas o técnicas razonables para resguardar la información.",
          ],
        },
        {
          title: "7. Conservación de la información",
          paragraphs: [
            "Conservamos los datos personales durante el tiempo necesario para cumplir las finalidades previstas en esta política, mantener la cuenta activa, prestar el servicio, atender reclamos, cumplir obligaciones legales y resguardar evidencia frente a eventuales controversias.",
            "Cuando la información deje de ser necesaria, será eliminada, anonimizada o bloqueada según corresponda y en la medida en que la legislación aplicable lo permita.",
          ],
        },
        {
          title: "8. Seguridad",
          paragraphs: [
            "Adoptamos medidas técnicas, organizativas y administrativas razonables para proteger los datos personales contra pérdida, acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún sistema puede garantizar seguridad absoluta, por lo que no podemos asegurar la invulnerabilidad total de la información transmitida o almacenada.",
          ],
        },
        {
          title: "9. Derechos de los titulares",
          paragraphs: [
            "Como titular de datos personales, podés ejercer los derechos de acceso, rectificación, actualización, supresión y confidencialidad en los términos de la Ley N° 25.326. También podés solicitar información sobre el tratamiento realizado respecto de tus datos.",
            "Las solicitudes podrán enviarse a [EMAIL LEGAL / SOPORTE]. Podremos requerir acreditación razonable de identidad antes de responder.",
            "LA AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.",
          ],
        },
        {
          title: "10. Cookies y tecnologías similares",
          paragraphs: [
            "El sitio y la aplicación pueden utilizar cookies, almacenamiento local y tecnologías similares para recordar preferencias, mantener sesiones, mejorar la experiencia, medir uso y reforzar la seguridad.",
            "Podés configurar tu navegador para rechazar o eliminar cookies, aunque ello podría afectar el funcionamiento de algunas funcionalidades.",
          ],
        },
        {
          title: "11. Menores de edad",
          paragraphs: [
            "Los servicios de Zimple Tools no están dirigidos a menores de edad sin intervención de sus representantes legales. Si detectamos que se han recolectado datos personales de menores en contravención a las reglas aplicables, podremos adoptar medidas para su eliminación o bloqueo.",
          ],
        },
        {
          title: "12. Cambios en esta política",
          paragraphs: [
            "Podemos actualizar esta Política de Privacidad para reflejar cambios legales, técnicos, operativos o comerciales. La versión vigente será la publicada en el sitio. Cuando corresponda, también podremos comunicar cambios relevantes por medios razonables.",
          ],
        },
      ]}
    />
  );
}
