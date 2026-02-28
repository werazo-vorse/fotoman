import Link from 'next/link'
import { FadeIn } from './components/fade-in'

const STEPS = [
  {
    number: '01',
    title: 'Consulte sus fotomultas',
    description: 'Ingrese su numero de cedula y consultamos el SIMIT al instante. Sin registro, sin complicaciones.',
    icon: (
      <svg className="h-7 w-7" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Analizamos sus defensas',
    description: 'Revisamos cada multa contra la ley colombiana y encontramos las defensas legales que aplican.',
    icon: (
      <svg className="h-7 w-7" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Impugnamos por usted',
    description: 'Generamos el derecho de peticion personalizado y lo enviamos directamente a la autoridad de transito.',
    icon: (
      <svg className="h-7 w-7" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
    ),
  },
]

const DEFENSES = [
  {
    title: 'Indebida Notificacion',
    description: 'Si no le notificaron dentro de los 13 dias habiles, la sancion es invalida.',
    legal: 'Ley 1843 de 2017, Art. 8',
    icon: (
      <svg className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Conductor No Identificado',
    description: 'La camara capta la placa, no al conductor. El propietario no puede ser sancionado automaticamente.',
    legal: 'Sentencia C-038/2020',
    icon: (
      <svg className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    gradient: 'from-brand-500 to-brand-700',
  },
  {
    title: 'Caducidad del Proceso',
    description: 'Si transcurrio mas de 1 año sin resolucion notificada, el proceso caduca automaticamente.',
    legal: 'Art. 161 Codigo Nacional de Transito',
    icon: (
      <svg className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Vicios Tecnicos',
    description: 'Falta de señalizacion, autorizacion o calibracion de la camara invalida la multa.',
    legal: 'Resolucion 718 de 2018',
    icon: (
      <svg className="h-6 w-6" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
      </svg>
    ),
    gradient: 'from-rose-500 to-pink-600',
  },
]

const STATS = [
  { value: '4', label: 'Defensas legales verificadas' },
  { value: '13', label: 'Dias habiles: plazo de notificacion' },
  { value: '~5 min', label: 'Tiempo promedio del proceso' },
]

const TRUST_ITEMS = [
  {
    icon: (
      <svg className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21" />
      </svg>
    ),
    title: 'Corte Constitucional',
    description: 'Sentencias C-038/2020 y C-321/2022 respaldan el derecho del ciudadano a impugnar',
  },
  {
    icon: (
      <svg className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: 'Derecho de peticion',
    description: 'Mecanismo constitucional (Art. 23). La autoridad DEBE responder en 15 dias habiles',
  },
  {
    icon: (
      <svg className="h-5 w-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: 'Datos protegidos',
    description: 'Su cedula nunca se comparte con terceros. Cifrado extremo a extremo',
  },
]

const FAQS = [
  {
    q: '¿Es legal impugnar una fotomulta?',
    a: 'Si. El derecho de peticion esta consagrado en el Articulo 23 de la Constitucion colombiana. Toda persona tiene derecho a presentar peticiones respetuosas a las autoridades. La autoridad de transito esta obligada a responder en 15 dias habiles.',
  },
  {
    q: '¿Que pasa si la autoridad rechaza mi impugnacion?',
    a: 'Le notificamos inmediatamente y le explicamos las opciones: puede escalar con una peticion de insistencia, interponer recurso de apelacion, o en casos de violacion de derechos fundamentales, considerar una accion de tutela.',
  },
  {
    q: '¿Cuanto tiempo toma el proceso completo?',
    a: 'La consulta y generacion del documento toman menos de 5 minutos. La autoridad de transito tiene 15 dias habiles para responder. Le hacemos seguimiento automatico y le avisamos apenas haya respuesta.',
  },
  {
    q: '¿Mis datos personales estan seguros?',
    a: 'Su numero de cedula se usa unicamente para la consulta SIMIT y la generacion del documento. Nunca se almacena en texto plano ni se comparte con terceros. Todo se cifra en transito y en reposo.',
  },
  {
    q: '¿Puedo usar Fotoman desde WhatsApp?',
    a: 'Si. Puede escribirnos por WhatsApp y nuestro asistente lo guiara por el mismo proceso: consulta, analisis, generacion y envio del documento. Mismo servicio, diferente canal.',
  },
]

const PRICING_FEATURES = [
  'Consulta SIMIT inmediata',
  'Analisis legal automatizado',
  'Documento de impugnacion personalizado',
  'Envio automatico a la autoridad',
  'Seguimiento completo del caso',
]

const CHAT_LINES = [
  { role: 'user', text: 'Tengo una fotomulta, mi placa es BYF83F' },
  { role: 'ai', text: 'Encontre 2 fotomultas registradas. Analizando defensas legales...' },
  { role: 'ai', text: 'Defensa aplicable: Indebida notificacion. La notificacion excedio los 13 dias habiles segun la Ley 1843/2017, Art. 8.' },
  { role: 'ai', text: '¿Desea que genere el derecho de peticion?' },
]

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-brand-950 px-4 pb-24 pt-20 sm:pb-32 sm:pt-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="animate-float-delay absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-brand-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-brand-900)_0%,_transparent_50%)] opacity-60" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-900/60 px-4 py-1.5 text-sm text-brand-200 backdrop-blur-sm">
                <span className="animate-pulse-soft inline-block h-2 w-2 rounded-full bg-accent-400" />
                Defensa legal automatizada
              </div>

              <h1 className="animate-fade-in-up text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                No pague fotomultas{' '}
                <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                  ilegales
                </span>
              </h1>

              <p className="animate-fade-in-up-delay mx-auto mt-6 max-w-xl text-lg leading-relaxed text-brand-200 sm:text-xl lg:mx-0">
                Analizamos sus multas de transito, identificamos defensas legales reales
                y generamos el documento de impugnacion. Todo en minutos.
              </p>

              <div className="animate-fade-in-up-delay-2 mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="/consulta"
                  className="group relative inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-brand-950 shadow-lg shadow-brand-900/50 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-900/40"
                >
                  Consultar mis fotomultas
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <span className="text-sm text-brand-200">Sin registro &middot; Resultado inmediato</span>
              </div>
            </div>

            {/* Right: product mockup */}
            <div className="animate-fade-in-up-delay-2 hidden lg:block">
              <div className="rounded-2xl border border-brand-700/40 bg-brand-900/40 p-1 shadow-2xl shadow-brand-950/60 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-700/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-700/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-700/60" />
                  <span className="ml-3 text-xs text-brand-400/50">Fotoman Asistente</span>
                </div>
                <div className="space-y-3 rounded-xl bg-brand-950/80 p-5">
                  {CHAT_LINES.map((line, i) => (
                    <div key={i} className={`flex ${line.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          line.role === 'user'
                            ? 'rounded-br-md bg-brand-600 text-white'
                            : 'rounded-bl-md bg-brand-800/60 text-brand-200'
                        }`}
                      >
                        {line.text}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-brand-800/60 px-4 py-3">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400 [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400 [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats ribbon */}
          <div className="mt-16 sm:mt-20">
            <div className="grid grid-cols-3 divide-x divide-brand-700/50 rounded-2xl border border-brand-700/40 bg-brand-900/50 p-6 backdrop-blur-md sm:p-8">
              {STATS.map((s) => (
                <div key={s.label} className="px-2 text-center sm:px-4">
                  <p className="text-2xl font-extrabold text-white sm:text-3xl">{s.value}</p>
                  <p className="mt-1 text-xs text-brand-200 sm:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative bg-surface px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="mb-14 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">Proceso</p>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Tres pasos. Sin complicaciones.</h2>
            </div>
          </FadeIn>

          <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((step, i) => (
              <FadeIn key={step.number} delay={i * 100}>
                <div className="group relative rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-brand-200">
                  {i < STEPS.length - 1 && (
                    <div className="pointer-events-none absolute right-0 top-14 hidden h-px w-8 translate-x-full bg-gradient-to-r from-brand-200 to-transparent sm:block" />
                  )}
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                      {step.icon}
                    </div>
                    <span className="text-sm font-bold text-brand-300">{step.number}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Defenses */}
      <section className="bg-white px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="mb-14 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">Estrategias</p>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Defensas legales que aplicamos</h2>
              <p className="mx-auto mt-3 max-w-lg text-gray-500">
                Basadas en la ley colombiana y jurisprudencia vigente de la Corte Constitucional
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-2">
            {DEFENSES.map((d, i) => (
              <FadeIn key={d.title} delay={i * 80}>
                <div className="group relative overflow-hidden rounded-3xl bg-gray-50 p-8 transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${d.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${d.gradient} text-white shadow-sm`}>
                    {d.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">{d.title}</h3>
                  <p className="mb-3 text-sm leading-relaxed text-gray-500">{d.description}</p>
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-400 ring-1 ring-gray-200">
                    <svg className="h-3 w-3" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                    {d.legal}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / Trust */}
      <section className="bg-surface px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="mb-14 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">Respaldo</p>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Respaldado por la ley colombiana</h2>
              <p className="mx-auto mt-3 max-w-lg text-gray-500">
                Nuestras defensas se basan en sentencias de la Corte Constitucional y leyes vigentes.
                No es una opinion: es jurisprudencia.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-3">
            {TRUST_ITEMS.map((item, i) => (
              <FadeIn key={item.title} delay={i * 100}>
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    {item.icon}
                  </div>
                  <h3 className="mb-1 font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={300}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {[
                'Ley 1843 de 2017',
                'Sentencia C-038/2020',
                'Sentencia C-321/2022',
                'Sentencia T-051/2016',
                'Art. 161 Codigo Nacional de Transito',
                'Resolucion 718/2018',
              ].map((ref) => (
                <span
                  key={ref}
                  className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                >
                  {ref}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <div className="mb-14 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">Precio</p>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Transparente y justo</h2>
              <p className="mx-auto mt-3 max-w-lg text-gray-500">
                Un solo precio por fotomulta. Sin costos ocultos, sin sorpresas.
              </p>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="mx-auto max-w-lg">
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
                <div className="h-1.5 bg-gradient-to-r from-brand-500 via-brand-400 to-accent-400" />
                <div className="p-10 text-center">
                  <p className="mb-1 text-sm font-medium text-gray-500">Por fotomulta impugnada</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm font-medium text-gray-400">$</span>
                    <span className="text-6xl font-extrabold tracking-tight text-gray-900">50.000</span>
                    <span className="text-sm font-medium text-gray-400">COP</span>
                  </div>
                  <div className="mx-auto mt-8 max-w-xs space-y-3 text-left">
                    {PRICING_FEATURES.map((f) => (
                      <div key={f} className="flex items-start gap-3">
                        <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span className="text-sm text-gray-600">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/consulta"
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 py-4 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl"
                  >
                    Comenzar ahora
                    <svg className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                  <p className="mt-3 text-xs text-gray-400">Solo paga si decide impugnar. La consulta es gratis.</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* What to expect */}
      <section className="bg-surface px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <div className="mb-14 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">Proceso</p>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">¿Que pasa despues?</h2>
              <p className="mx-auto mt-3 max-w-lg text-gray-500">
                Desde la consulta hasta la respuesta de la autoridad, le acompañamos en cada paso.
              </p>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="relative pl-8">
              <div className="absolute bottom-0 left-3 top-0 w-px bg-gradient-to-b from-brand-400 via-brand-200 to-transparent" />
              {[
                { title: 'Usted consulta sus fotomultas', detail: 'Ingresa su cedula, nosotros hacemos la busqueda en SIMIT.', time: '1 minuto' },
                { title: 'Analizamos sus defensas', detail: 'Revisamos plazos, notificaciones y jurisprudencia aplicable.', time: '1 minuto' },
                { title: 'Revisa y aprueba el documento', detail: 'Le mostramos el derecho de peticion personalizado. Usted decide si lo envia.', time: '2 minutos' },
                { title: 'Enviamos a la autoridad', detail: 'Radicamos el documento ante la secretaria de transito por correo certificado.', time: 'Inmediato' },
                { title: 'Seguimiento automatico', detail: 'Le avisamos cuando la autoridad responda o si vence el plazo de 15 dias habiles.', time: 'Hasta 15 dias habiles' },
              ].map((step, i) => (
                <div key={i} className="relative mb-8 last:mb-0">
                  <div className="absolute -left-5 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-brand-400 bg-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-bold text-gray-900">{step.title}</h3>
                      <span className="shrink-0 text-xs text-brand-500">{step.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <FadeIn>
            <div className="mb-14 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">FAQ</p>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Preguntas frecuentes</h2>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="divide-y divide-gray-100 rounded-3xl bg-gray-50 ring-1 ring-gray-100">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group">
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100/50 [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <svg
                      className="ml-4 h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-45"
                      aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 text-sm leading-relaxed text-gray-500">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Final CTA + WhatsApp */}
      <section className="relative overflow-hidden bg-brand-950 px-4 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            ¿Tiene una fotomulta?
          </h2>
          <p className="mt-4 text-lg text-brand-200">
            Consulte gratis si tiene defensas legales aplicables. Toma menos de un minuto.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/consulta"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-brand-950 shadow-lg shadow-brand-900/50 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Consultar ahora
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            <span className="text-sm text-brand-400">o</span>

            <a
              href="https://wa.me/573000000000?text=Hola%2C%20tengo%20una%20fotomulta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-brand-600 bg-brand-900/50 px-6 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-800/60"
            >
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Tambien por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
