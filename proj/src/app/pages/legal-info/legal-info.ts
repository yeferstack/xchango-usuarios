import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LegalBlock {
  heading?: string;
  text?: string;
  items?: string[];
}

interface LegalSection {
  id: string;
  icon: 'doc' | 'help' | 'shield' | 'mail';
  eyebrow: string;
  title: string;
  meta?: string;
  blocks: LegalBlock[];
}

@Component({
  selector: 'app-legal-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './legal-info.html',
  styleUrls: ['./legal-info.css'],
})
export class LegalInfo {
  /** Tab activo. Cambia el contenido sin navegar a otra ruta. */
  activeTab = signal<string>('terminos');

  readonly sections: LegalSection[] = [
    {
      id: 'terminos',
      icon: 'doc',
      eyebrow: 'Legal',
      title: 'Términos y condiciones de uso del sitio',
      meta: 'Versión vigente: 20 de febrero, 2026',
      blocks: [
        {
          heading: 'Resumen de términos y condiciones',
          text: 'XchanGo es una plataforma diseñada para fomentar la economía circular a través del intercambio directo de bienes y servicios, eliminando la necesidad de transacciones monetarias.',
        },
        {
          heading: 'Nuestro ecosistema de intercambio',
          items: [
            'El Marketplace de Trueque: es el espacio principal donde las personas usuarias publican lo que ya no necesitan y encuentran lo que buscan, gestionando propuestas de intercambio directo.',
            'XchanGo Especializados (VIS): conectamos a personas interesadas en realizar permutas o intercambios de mayor envergadura, como vehículos, inmuebles o servicios profesionales.',
            'Logística XchanGo: ponemos a disposición soluciones tecnológicas para que las personas usuarias puedan coordinar el envío y la recepción de los objetos intercambiados de forma eficiente.',
            'XchanGo Ads & Comunidad: ofrecemos herramientas para destacar publicaciones y fortalecer la red de confianza entre usuarios, con el fin de democratizar el acceso a bienes y servicios sin depender del capital financiero.',
          ],
        },
        {
          heading: 'Responsabilidades del usuario',
          items: [
            'Registro y veracidad: para operar en la plataforma, cada persona usuaria debe aceptar estos términos, sus anexos y la Declaración de Privacidad. Es responsable de la veracidad de los datos brindados y de mantener su contraseña bajo estricto resguardo.',
            'Descripción del bien: el usuario se obliga a describir con honestidad el estado real del objeto o servicio que ofrece para intercambio.',
          ],
        },
      ],
    },
    {
      id: 'ayuda',
      icon: 'help',
      eyebrow: 'Soporte',
      title: 'Centro de ayuda al usuario de XchanGo',
      blocks: [
        {
          text: 'En XchanGo queremos que tu experiencia de intercambio sea lo más fluida y sencilla posible. Si eres nuevo en la comunidad o tienes dudas técnicas sobre cómo funciona nuestra plataforma, aquí encontrarás los recursos necesarios para resolverlas.',
        },
        {
          heading: 'Guías rápidas para el trueque',
          items: [
            '¿Cómo publicar mi primer objeto?: aprende a tomar fotos atractivas y a redactar descripciones honestas para que otros se interesen en tu intercambio.',
            'Búsqueda de servicios: utiliza nuestros filtros avanzados para encontrar talentos locales, desde clases particulares hasta reparaciones técnicas.',
            'Cómo proponer un trato: consejos sobre cómo redactar mensajes claros y justos al momento de acordar un intercambio equilibrado para ambas partes.',
          ],
        },
        {
          heading: 'Soporte técnico y resolución de problemas',
          items: [
            'Gestión de perfil: instrucciones paso a paso para actualizar tu información, cambiar tu contraseña o mejorar tu nivel de verificación.',
            'Reportar un incidente: si un intercambio no salió como esperabas o detectas un comportamiento sospechoso, te enseñamos a usar nuestras herramientas de reporte.',
          ],
        },
      ],
    },
    {
      id: 'privacidad',
      icon: 'shield',
      eyebrow: 'Confianza',
      title: 'Privacidad y verificación en XchanGo',
      blocks: [
        {
          text: 'En XchanGo, la seguridad de nuestra comunidad es nuestra prioridad número uno. Entendemos que el intercambio de objetos y servicios requiere un entorno de confianza mutua, por lo que hemos implementado procesos estrictos para proteger tanto tus datos como tu integridad física y material.',
        },
        {
          heading: 'Nuestros pilares de seguridad',
          items: [
            'Protección de datos personales: implementamos protocolos de seguridad avanzados para asegurar que tu información de contacto y ubicación solo sea compartida con otros usuarios bajo tu autorización explícita durante un intercambio.',
            'Verificación de identidad: para evitar perfiles falsos, cada miembro de XchanGo debe completar un proceso de verificación que incluye la validación de correo electrónico y, opcionalmente, documentos de identidad para obtener la insignia de "Usuario Verificado".',
            'Sistema de reputación y reseñas: después de cada intercambio, ambas partes pueden calificarse. Este historial es público y permite a los nuevos usuarios verificar la fiabilidad de sus futuros compañeros de trueque.',
            'Monitoreo de contenido: contamos con herramientas de moderación que analizan las publicaciones para asegurar que no se intercambien artículos prohibidos o servicios que no cumplan con nuestras normas comunitarias.',
            'Transparencia en el trato: el contacto entre usuarios continúa por WhatsApp con el número registrado en el perfil. XchanGo no almacena conversaciones: conserva el historial de WhatsApp como respaldo de lo pactado.',
          ],
        },
      ],
    },
    {
      id: 'contacto',
      icon: 'mail',
      eyebrow: 'Contacto',
      title: 'Canales de contacto oficial de XchanGo',
      blocks: [
        {
          text: 'En XchanGo valoramos la comunicación abierta con nuestra comunidad. Ya sea que tengas una propuesta comercial, necesites asistencia técnica especializada o simplemente quieras darnos una sugerencia para mejorar el intercambio de objetos y servicios, ponemos a tu disposición nuestros canales oficiales de atención.',
        },
        {
          heading: 'Nuestras vías de comunicación',
          items: [
            'Soporte técnico: para reportar fallos en la plataforma o problemas con tu cuenta, escríbenos a soporte@xchango.com. Atendemos tus requerimientos en un plazo máximo de 24 horas hábiles.',
            'Atención al cliente: si tienes dudas sobre un intercambio en curso o el sistema de reputación, nuestro equipo de conciliación está disponible en hola@xchango.com.',
            'Alianzas y prensa: para propuestas de colaboración institucional o consultas de medios de comunicación, el contacto directo es prensa@xchango.com.',
            'Redes sociales: encuéntranos como @XchanGoOficial en Instagram, Facebook y LinkedIn para estar al tanto de las novedades y los trueques más exitosos de la semana.',
          ],
        },
      ],
    },
  ];

  activeSection = computed<LegalSection>(
    () => this.sections.find((s) => s.id === this.activeTab()) ?? this.sections[0]
  );

  setTab(id: string): void {
    this.activeTab.set(id);
  }
}