const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Dependencia = require('../models/dependencia');
const Categoria = require('../models/categoria');
const Oferta = require('../models/oferta');
const PerfilEstudiante = require('../models/perfilEstudiante');
const Postulacion = require('../models/postulacion');
const Matching = require('../models/matching');

dotenv.config();

const dependencias = [
  {
    nombre: 'Facultad de Ingenierías',
    descripcion: 'Coordina prácticas para los programas de ingeniería, apoyando proyectos de innovación y desarrollo tecnológico.',
    correoContacto: 'practicas.ingenierias@practinexo.edu.co',
    telefonoContacto: '+57 604 444 1234 ext. 2101',
    ubicacion: 'Bloque 21, Piso 3 - Sede Robledo',
  },
  {
    nombre: 'Vicerrectoría de Extensión y Proyección Social',
    descripcion: 'Vínculo entre la institución y la comunidad; gestiona el servicio social y proyectos sociales con entidades externas.',
    correoContacto: 'extension@practinexo.edu.co',
    telefonoContacto: '+57 604 444 1234 ext. 3001',
    ubicacion: 'Bloque Administrativo, Piso 2',
  },
  {
    nombre: 'Centro de Innovación y Emprendimiento',
    descripcion: 'Acompaña ideas de negocio, prototipado y validación de productos digitales de base tecnológica.',
    correoContacto: 'innovacion@practinexo.edu.co',
    telefonoContacto: '+57 604 444 1234 ext. 4500',
    ubicacion: 'Edificio Emprendimiento - Sede Poblado',
  },
  {
    nombre: 'Departamento de Bienestar Universitario',
    descripcion: 'Promueve el desarrollo integral del estudiante; canaliza iniciativas solidarias y de impacto social.',
    correoContacto: 'bienestar@practinexo.edu.co',
    telefonoContacto: '+57 604 444 1234 ext. 2800',
    ubicacion: 'Bloque 31, Piso 1',
  },
  {
    nombre: 'Biblioteca General',
    descripcion: 'Gestión de información, servicios bibliográficos y proyectos de transformación digital documental.',
    correoContacto: 'biblioteca@practinexo.edu.co',
    telefonoContacto: '+57 604 444 1234 ext. 1900',
    ubicacion: 'Edificio Biblioteca - Sede Robledo',
  },
  {
    nombre: 'Centro de Investigaciones - CIDTEC',
    descripcion: 'Apoya semilleros y proyectos de investigación aplicada en ciencia, tecnología e innovación.',
    correoContacto: 'cidtec@practinexo.edu.co',
    telefonoContacto: '+57 604 444 1234 ext. 5100',
    ubicacion: 'Bloque 18, Piso 4',
  },
];

const categorias = [
  {
    nombre: 'Tecnología y Desarrollo',
    descripcion: 'Desarrollo de software, datos, IA, infraestructura y calidad.',
  },
  {
    nombre: 'Gestión y Administración',
    descripcion: 'Procesos administrativos, financieros, gestión documental y de proyectos.',
  },
  {
    nombre: 'Comunicación y Marketing',
    descripcion: 'Comunicación digital, contenidos, diseño y mercadeo institucional.',
  },
  {
    nombre: 'Investigación',
    descripcion: 'Apoyo a semilleros, proyectos de I+D+i y vigilancia tecnológica.',
  },
  {
    nombre: 'Impacto Social',
    descripcion: 'Servicio social, intervención comunitaria y acompañamiento a poblaciones vulnerables.',
  },
];

const programas = [
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Ingeniería Electrónica',
  'Administración de Empresas',
  'Contaduría Pública',
  'Comunicación Social',
  'Psicología',
];

const areas = [
  'Desarrollo de Software',
  'Ciencia de Datos',
  'Infraestructura TI',
  'Calidad de Software',
  'Automatización de Procesos',
  'Mercadeo Digital',
  'Gestión Documental',
  'Comunidades y Territorio',
  'Investigación Aplicada',
];

const hoy = new Date();
const enDias = (d) => new Date(hoy.getTime() + d * 86400000);
const haceDias = (d) => new Date(hoy.getTime() - d * 86400000);

const ofertas = [
  {
    titulo: 'Practicante de Desarrollo Frontend (React)',
    descripcion:
      'Acompañamiento al equipo de desarrollo en la construcción de interfaces accesibles para el nuevo portal institucional.\n\n' +
      'Funciones principales:\n- Implementar componentes React a partir de mockups en Figma.\n- Consumir APIs REST documentadas con Axios/React Query.\n- Participar en code reviews y pair programming con el equipo senior.\n- Escribir pruebas unitarias con Vitest.\n\n' +
      'Modalidad híbrida. Disponibilidad para reuniones semanales de sincronización los martes y jueves.',
    tipoOportunidad: 'PRACTICA',
    requisitos: [
      'Tener aprobado el 60% del plan de estudios de Ingeniería de Sistemas.',
      'Conocimientos de HTML, CSS y JavaScript moderno (ES2020+).',
      'Experiencia académica con React.',
      'Git y trabajo colaborativo en GitHub.',
    ],
    fechaPublicacion: haceDias(7),
    fechaCierre: enDias(21),
    estadoVigencia: 'ACTIVA',
    contacto: 'frontend-jobs@practinexo.edu.co',
    programaAcademico: 'Ingeniería de Sistemas',
    areaInteres: 'Desarrollo de Software',
    disponibilidad: 'Híbrido',
    palabrasClave: ['React', 'JavaScript', 'HTML', 'CSS', 'Frontend', 'Figma', 'Git'],
    dependenciaNombre: 'Centro de Innovación y Emprendimiento',
    categoriaNombre: 'Tecnología y Desarrollo',
  },
  {
    titulo: 'Auxiliar de Investigación - Analítica de Datos',
    descripcion:
      'Apoyo al semillero de analítica en tareas de exploración, limpieza y modelado de datos para un proyecto sobre abandono estudiantil.\n\n' +
      'Trabajarás con un dataset anonimizado, en Python con pandas y scikit-learn, y producirás visualizaciones para informes trimestrales.',
    tipoOportunidad: 'PRACTICA',
    requisitos: [
      'Estudiante de Ingeniería de Sistemas, Industrial o afines desde 5° semestre.',
      'Python intermedio (pandas, numpy).',
      'Estadística básica y nociones de machine learning.',
      'Disponibilidad de 16 horas semanales.',
    ],
    fechaPublicacion: haceDias(3),
    fechaCierre: enDias(30),
    estadoVigencia: 'ACTIVA',
    contacto: 'cidtec.analitica@practinexo.edu.co',
    programaAcademico: 'Ingeniería de Sistemas',
    areaInteres: 'Ciencia de Datos',
    disponibilidad: 'Presencial',
    palabrasClave: ['Python', 'Pandas', 'Scikit-learn', 'Analítica', 'Datos', 'Machine Learning'],
    dependenciaNombre: 'Centro de Investigaciones - CIDTEC',
    categoriaNombre: 'Investigación',
  },
  {
    titulo: 'Practicante de Calidad de Software (QA)',
    descripcion:
      'Diseño y ejecución de pruebas funcionales, de regresión y de humo para la suite institucional de aplicaciones internas.\n\n' +
      'Uso de Playwright para E2E y Postman/Newman para pruebas de API. Reportarás hallazgos en Jira y colaborarás con el equipo de desarrollo.',
    tipoOportunidad: 'PRACTICA',
    requisitos: [
      'Ingeniería de Sistemas, mínimo 4° semestre.',
      'Manejo de herramientas de testing (Playwright, Cypress o Selenium).',
      'Conceptos de API REST y JSON.',
      'Atención al detalle y capacidad de documentar casos de prueba.',
    ],
    fechaPublicacion: haceDias(5),
    fechaCierre: enDias(14),
    estadoVigencia: 'ACTIVA',
    contacto: 'qa.jobs@practinexo.edu.co',
    programaAcademico: 'Ingeniería de Sistemas',
    areaInteres: 'Calidad de Software',
    disponibilidad: 'Remoto',
    palabrasClave: ['QA', 'Testing', 'Playwright', 'Cypress', 'API', 'Postman', 'Automatización'],
    dependenciaNombre: 'Facultad de Ingenierías',
    categoriaNombre: 'Tecnología y Desarrollo',
  },
  {
    titulo: 'Apoyo en Gestión Documental y Archivo',
    descripcion:
      'Clasificación, digitalización y catalogación del archivo físico e histórico de la Biblioteca General.\n\n' +
      'Trabajo con normas archivísticas colombianas y herramientas ofimáticas. Acompañamiento al equipo de transformación digital.',
    tipoOportunidad: 'PRACTICA',
    requisitos: [
      'Estudiante de Administración, Contaduría o Comunicación.',
      'Manejo de Excel intermedio.',
      'Interés en gestión documental y bibliotecas.',
      'Responsabilidad y orden en el manejo de información.',
    ],
    fechaPublicacion: haceDias(10),
    fechaCierre: enDias(25),
    estadoVigencia: 'ACTIVA',
    contacto: 'biblioteca.practicas@practinexo.edu.co',
    programaAcademico: 'Administración de Empresas',
    areaInteres: 'Gestión Documental',
    disponibilidad: 'Presencial',
    palabrasClave: ['Archivo', 'Documental', 'Excel', 'Biblioteca', 'Administración'],
    dependenciaNombre: 'Biblioteca General',
    categoriaNombre: 'Gestión y Administración',
  },
  {
    titulo: 'Servicio Social - Acompañamiento Comunitario en Aranjuez',
    descripcion:
      'Apoyo en actividades lúdico-pedagógicas y refuerzo escolar con niños y niñas de 6 a 12 años en el barrio Aranjuez, en alianza con la Junta de Acción Comunal.\n\n' +
      'Las sesiones se realizan los sábados de 9 a.m. a 12 m. Se requiere compromiso mínimo de 4 meses.',
    tipoOportunidad: 'SERVICIO_SOCIAL',
    requisitos: [
      'Ser estudiante activo de la institución.',
      'Disponibilidad los sábados en la mañana.',
      'Vocación de servicio y trabajo con comunidades.',
      'No tener servicio social activo o sancionado.',
    ],
    fechaPublicacion: haceDias(2),
    fechaCierre: enDias(40),
    estadoVigencia: 'ACTIVA',
    contacto: '+57 304 555 1020',
    programaAcademico: 'Psicología',
    areaInteres: 'Comunidades y Territorio',
    disponibilidad: 'Presencial',
    palabrasClave: ['Comunidad', 'Niños', 'Refuerzo', 'Social', 'Aranjuez', 'Pedagogía'],
    dependenciaNombre: 'Departamento de Bienestar Universitario',
    categoriaNombre: 'Impacto Social',
  },
  {
    titulo: 'Servicio Social - Alfabetización Digital para Adultos Mayores',
    descripcion:
      'Capacitación básica en uso de smartphone, correo electrónico, WhatsApp y trámites en línea, dirigida a adultos mayores del Centro Día de la Comuna 1.\n\n' +
      'Las sesiones son semanales en horario diurno. Se entrega constancia de servicio social reconocida por la Vicerrectoría.',
    tipoOportunidad: 'SERVICIO_SOCIAL',
    requisitos: [
      'Paciabilidad y empatía con personas adultas mayores.',
      'Conocimientos básicos de ofimática y aplicaciones móviles.',
      'Disponibilidad de 4 horas semanales.',
      'Compromiso mínimo de 3 meses.',
    ],
    fechaPublicacion: haceDias(1),
    fechaCierre: enDias(60),
    estadoVigencia: 'ACTIVA',
    contacto: 'alfabetizacion.digital@practinexo.edu.co',
    programaAcademico: 'Ingeniería de Sistemas',
    areaInteres: 'Comunidades y Territorio',
    disponibilidad: 'Presencial',
    palabrasClave: ['Alfabetización', 'Digital', 'Adulto Mayor', 'Social', 'Inclusión'],
    dependenciaNombre: 'Vicerrectoría de Extensión y Proyección Social',
    categoriaNombre: 'Impacto Social',
  },
  {
    titulo: 'Practicante de Marketing Digital y Contenido',
    descripcion:
      'Producción de contenido para redes sociales institucionales (Instagram, LinkedIn, TikTok) y apoyo en la estrategia de comunicación digital del Centro de Innovación.\n\n' +
      'Trabajo con calendario editorial, métricas y herramientas como Canva, Meta Business Suite y HubSpot.',
    tipoOportunidad: 'PRACTICA',
    requisitos: [
      'Estudiante de Comunicación Social, Mercadeo o afines.',
      'Buena redacción y ortografía.',
      'Manejo de Canva o Adobe Creative.',
      'Interés en marketing digital y métricas.',
    ],
    fechaPublicacion: haceDias(6),
    fechaCierre: enDias(18),
    estadoVigencia: 'ACTIVA',
    contacto: 'marketing.innovacion@practinexo.edu.co',
    programaAcademico: 'Comunicación Social',
    areaInteres: 'Mercadeo Digital',
    disponibilidad: 'Híbrido',
    palabrasClave: ['Marketing', 'Redes Sociales', 'Contenido', 'Canva', 'Comunicación', 'Digital'],
    dependenciaNombre: 'Centro de Innovación y Emprendimiento',
    categoriaNombre: 'Comunicación y Marketing',
  },
  {
    titulo: 'Practicante de Infraestructura TI y Redes',
    descripcion:
      'Apoyo en el monitoreo de servicios, mantenimiento preventivo de equipos y documentación de procedimientos del datacenter institucional.\n\n' +
      'Trabajo con Linux, herramientas de monitoring (Zabbix, Grafana) y cableado estructurado.',
    tipoOportunidad: 'PRACTICA',
    requisitos: [
      'Ingeniería de Sistemas o Electrónica, 6° semestre en adelante.',
      'Linux intermedio (terminal, servicios, shell).',
      'Conceptos de redes TCP/IP y cableado estructurado.',
      'Responsabilidad y disposición para trabajo en horario flexible.',
    ],
    fechaPublicacion: haceDias(4),
    fechaCierre: enDias(28),
    estadoVigencia: 'ACTIVA',
    contacto: 'infra.ti@practinexo.edu.co',
    programaAcademico: 'Ingeniería de Sistemas',
    areaInteres: 'Infraestructura TI',
    disponibilidad: 'Presencial',
    palabrasClave: ['Linux', 'Redes', 'TCP/IP', 'Zabbix', 'Grafana', 'Infraestructura'],
    dependenciaNombre: 'Facultad de Ingenierías',
    categoriaNombre: 'Tecnología y Desarrollo',
  },
  {
    titulo: 'Practicante de Automatización de Procesos (RPA)',
    descripcion:
      'Identificación y automatización de procesos administrativos repetitivos con Python y UiPath, en alianza con la Vicerrectoría Administrativa.\n\n' +
      'Documentarás los flujos automatizados y acompañarás la capacitación a usuarios finales.',
    tipoOportunidad: 'PRACTICA',
    requisitos: [
      'Ingeniería de Sistemas o Industrial, 7° semestre en adelante.',
      'Python intermedio.',
      'Deseable: nociones de UiPath o Power Automate.',
      'Pensamiento analítico y orientación al detalle.',
    ],
    fechaPublicacion: haceDias(8),
    fechaCierre: enDias(22),
    estadoVigencia: 'ACTIVA',
    contacto: 'rpa.practicas@practinexo.edu.co',
    programaAcademico: 'Ingeniería de Sistemas',
    areaInteres: 'Automatización de Procesos',
    disponibilidad: 'Híbrido',
    palabrasClave: ['RPA', 'Python', 'UiPath', 'Automatización', 'Procesos'],
    dependenciaNombre: 'Vicerrectoría de Extensión y Proyección Social',
    categoriaNombre: 'Tecnología y Desarrollo',
  },
  {
    titulo: 'Servicio Social - Brigadas de Salud Visual',
    descripcion:
      'Apoyo logístico y pedagógico en brigadas de salud visual realizadas en alianza con la Secretaría de Salud en corregimientos del Valle de Aburrá.\n\n' +
      'Se requieren 80 horas totales distribuidas en fines de semana.',
    tipoOportunidad: 'SERVICIO_SOCIAL',
    requisitos: [
      'Vocación de servicio y trabajo en equipo.',
      'Disponibilidad para desplazamientos a zonas rurales.',
      'Estar matriculado académicamente.',
      'No tener sanciones disciplinarias vigentes.',
    ],
    fechaPublicacion: haceDias(9),
    fechaCierre: enDias(35),
    estadoVigencia: 'ACTIVA',
    contacto: '+57 301 555 8899',
    programaAcademico: 'Psicología',
    areaInteres: 'Comunidades y Territorio',
    disponibilidad: 'Presencial',
    palabrasClave: ['Salud', 'Brigadas', 'Comunidad', 'Rural', 'Social'],
    dependenciaNombre: 'Departamento de Bienestar Universitario',
    categoriaNombre: 'Impacto Social',
  },
  {
    titulo: 'Practicante de Contabilidad y NIIF',
    descripcion:
      'Apoyo al equipo financiero en conciliaciones, registros contables y aplicación de NIIF para pyme.\n\n' +
      'Trabajo con Siigo y Excel avanzado. Acompañamiento directo por contador senior.',
    tipoOportunidad: 'PRACTICA',
    requisitos: [
      'Contaduría Pública, 6° semestre en adelante.',
      'Conocimientos básicos de NIIF.',
      'Excel avanzado (tablas dinámicas, BUSCARV).',
      'Atención al detalle y responsabilidad.',
    ],
    fechaPublicacion: haceDias(11),
    fechaCierre: enDias(20),
    estadoVigencia: 'ACTIVA',
    contacto: 'contabilidad.practicas@practinexo.edu.co',
    programaAcademico: 'Contaduría Pública',
    areaInteres: 'Gestión Documental',
    disponibilidad: 'Presencial',
    palabrasClave: ['Contabilidad', 'NIIF', 'Siigo', 'Excel', 'Finanzas'],
    dependenciaNombre: 'Vicerrectoría de Extensión y Proyección Social',
    categoriaNombre: 'Gestión y Administración',
  },
  {
    titulo: 'Practicante de Diseño UX/UI',
    descripcion:
      'Diseño de interfaces para el nuevo portal institucional y de aplicaciones internas.\n\n' +
      'Trabajo en Figma con el equipo de producto: wireframes, prototipado, pruebas de usabilidad y handoff a desarrollo.',
    tipoOportunidad: 'PRACTICA',
    requisitos: [
      'Comunicación Social, Diseño Visual o Ingeniería de Sistemas.',
      'Figma intermedio: componentes, auto-layout, design tokens.',
      'Portafolio de proyectos (académicos o personales).',
      'Conocimiento básico de accesibilidad WCAG.',
    ],
    fechaPublicacion: haceDias(2),
    fechaCierre: enDias(45),
    estadoVigencia: 'ACTIVA',
    contacto: 'diseno.ux@practinexo.edu.co',
    programaAcademico: 'Comunicación Social',
    areaInteres: 'Desarrollo de Software',
    disponibilidad: 'Remoto',
    palabrasClave: ['UX', 'UI', 'Figma', 'Diseño', 'Accesibilidad', 'Prototipado'],
    dependenciaNombre: 'Centro de Innovación y Emprendimiento',
    categoriaNombre: 'Comunicación y Marketing',
  },
];

async function limpiar() {
  console.log('Limpiando colecciones...');
  await Promise.all([
    Oferta.deleteMany({}),
    PerfilEstudiante.deleteMany({}),
    Postulacion.deleteMany({}),
    Matching.deleteMany({}),
  ]);
  await Dependencia.deleteMany({});
  await Categoria.deleteMany({});
  console.log('Colecciones limpiadas.');
}

async function sembrar() {
  console.log('Sembrando dependencias...');
  const depDocs = await Dependencia.insertMany(dependencias);
  const depByName = Object.fromEntries(depDocs.map((d) => [d.nombre, d._id]));

  console.log('Sembrando categorias...');
  const catDocs = await Categoria.insertMany(categorias);
  const catByName = Object.fromEntries(catDocs.map((c) => [c.nombre, c._id]));

  console.log('Sembrando ofertas...');
  const ofertaDocs = [];
  for (const o of ofertas) {
    const dep = depByName[o.dependenciaNombre];
    const cat = catByName[o.categoriaNombre];
    if (!dep) throw new Error(`Dependencia no encontrada: ${o.dependenciaNombre}`);
    if (!cat) throw new Error(`Categoria no encontrada: ${o.categoriaNombre}`);
    ofertaDocs.push({
      titulo: o.titulo,
      descripcion: o.descripcion,
      tipoOportunidad: o.tipoOportunidad,
      requisitos: o.requisitos,
      fechaPublicacion: o.fechaPublicacion,
      fechaCierre: o.fechaCierre,
      estadoVigencia: o.estadoVigencia,
      contacto: o.contacto,
      programaAcademico: o.programaAcademico,
      areaInteres: o.areaInteres,
      disponibilidad: o.disponibilidad,
      palabrasClave: o.palabrasClave,
      dependenciaId: dep,
      categoriaId: cat,
    });
  }
  const creadas = await Oferta.insertMany(ofertaDocs);
  console.log(`${creadas.length} ofertas creadas.`);

  return { depDocs, catDocs, creadas };
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB.');
  await limpiar();
  await sembrar();
  console.log('\nResumen de datos sembrados:');
  console.log(`- Dependencias: ${dependencias.length}`);
  console.log(`- Categorias:   ${categorias.length}`);
  console.log(`- Ofertas:      ${ofertas.length}`);
  await mongoose.connection.close();
  console.log('\nSeed Beta completado.');
}

main()
  .catch((error) => {
    console.error('Error en seed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
