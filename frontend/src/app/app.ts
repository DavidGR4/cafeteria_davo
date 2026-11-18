import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  ApiService,
  CafeteriaInfo,
  ContactoDatos,
  Especialidad,
  HistorialChatbot,
  ProductoPrecio,
  Servicio
} from './services/api.service';
import { finalize } from 'rxjs';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html'
})
export class App implements OnInit {
  private readonly api = inject(ApiService);

  readonly info = signal<CafeteriaInfo | null>(null);
  readonly servicios = signal<Servicio[]>([]);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly productos = signal<ProductoPrecio[]>([]);
  readonly categorias = computed(() => [
    'Todos',
    ...new Set(this.productos().map((producto) => producto.categoria).filter(Boolean))
  ]);
  readonly categoriaSeleccionada = signal('Todos');
  readonly productosFiltrados = computed(() => {
    const categoria = this.categoriaSeleccionada();
    return categoria === 'Todos'
      ? this.productos()
      : this.productos().filter((producto) => producto.categoria === categoria);
  });
  readonly tituloParte2Lineas = computed(() => {
    const palabras = this.info()?.titulo_parte2.trim().split(/\s+/).filter(Boolean) ?? [];
    return palabras.length > 1
      ? [palabras.slice(0, -1).join(' '), palabras[palabras.length - 1]]
      : palabras;
  });
  readonly erroresCarga = signal<string[]>([]);
  readonly contactoEnviado = signal(false);
  readonly enviandoContacto = signal(false);
  readonly errorContacto = signal<string | null>(null);
  readonly chatAbierto = signal(false);
  readonly chatMensajes = signal<ChatMessage[]>([]);
  readonly enviandoChat = signal(false);
  readonly errorChat = signal<string | null>(null);

  listaVideos: string[] = [];
  videoActualIndex = 0;
  readonly videosFallidos = new Set<number>();
  videoError: string | null = null;
  chatPrompt = '';

  contacto: ContactoDatos = {
    nombre_completo: '',
    email: '',
    telefono: '',
    motivo_contacto: '',
    fecha_reserva: '',
    cantidad_personas: 1,
    mensaje: ''
  };

  ngOnInit(): void {
    this.api.getInfo().subscribe({
      next: (info) => {
        if (info) {
          this.info.set(info);
          this.listaVideos = info.video_url
            .split(',')
            .map((url) => url.trim())
            .filter(Boolean);
          this.videosFallidos.clear();
          this.videoActualIndex = 0;
        }
      },
      error: (error: unknown) => this.registrarErrorCarga('No se pudo cargar la información de la cafetería.', error)
    });

    this.api.getServicios().subscribe({
      next: (servicios) => this.servicios.set(servicios),
      error: (error: unknown) => this.registrarErrorCarga('No se pudieron cargar los servicios.', error)
    });

    this.api.getEspecialidades().subscribe({
      next: (especialidades) => this.especialidades.set(especialidades),
      error: (error: unknown) => this.registrarErrorCarga('No se pudieron cargar las especialidades.', error)
    });

    this.api.getProductosPrecios().subscribe({
      next: (productos) => this.productos.set(productos),
      error: (error: unknown) => this.registrarErrorCarga('No se pudieron cargar los productos y precios.', error)
    });
  }

  seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada.set(categoria);
  }

  forzarPlay(event: Event): void {
    const video = event.currentTarget;
    if (video instanceof HTMLVideoElement) {
      this.videoError = null;
      void video.play().catch((error: unknown) => {
        console.error('No fue posible iniciar el video del hero.', error);
        this.videoError = 'No fue posible reproducir el video.';
      });
    }
  }

  manejarErrorVideo(): void {
    this.videosFallidos.add(this.videoActualIndex);
    console.error(`No fue posible cargar el video ${this.videoActualIndex + 1} del hero.`);

    for (let offset = 1; offset < this.listaVideos.length; offset += 1) {
      const siguiente = (this.videoActualIndex + offset) % this.listaVideos.length;
      if (!this.videosFallidos.has(siguiente)) {
        this.videoActualIndex = siguiente;
        this.videoError = null;
        return;
      }
    }

    this.videoError = 'No se pudo cargar ninguno de los videos del hero.';
  }

  siguienteVideo(): void {
    if (this.listaVideos.length > 1) {
      for (let offset = 1; offset < this.listaVideos.length; offset += 1) {
        const siguiente = (this.videoActualIndex + offset) % this.listaVideos.length;
        if (!this.videosFallidos.has(siguiente)) {
          this.videoActualIndex = siguiente;
          return;
        }
      }
    }
  }

  enviarContacto(formulario: NgForm): void {
    if (formulario.invalid || this.enviandoContacto()) {
      formulario.control.markAllAsTouched();
      return;
    }

    this.enviandoContacto.set(true);
    this.contactoEnviado.set(false);
    this.errorContacto.set(null);

    this.api.enviarContacto(this.contacto)
      .pipe(finalize(() => this.enviandoContacto.set(false)))
      .subscribe({
        next: () => {
          this.contactoEnviado.set(true);
          this.contacto = {
            nombre_completo: '',
            email: '',
            telefono: '',
            motivo_contacto: '',
            fecha_reserva: '',
            cantidad_personas: 1,
            mensaje: ''
          };
          formulario.resetForm(this.contacto);
        },
        error: (error: unknown) => {
          console.error('No fue posible enviar el contacto.', error);
          this.errorContacto.set('No se pudo enviar el formulario. Inténtalo nuevamente.');
        }
      });
  }

  enviarPreguntaChatbot(): void {
    const prompt = this.chatPrompt.trim();
    if (!prompt || this.enviandoChat()) {
      return;
    }

    const historialPrevio: HistorialChatbot[] = this.chatMensajes().map((mensaje) => ({
      sender: mensaje.role === 'user' ? 'user' : 'bot',
      text: mensaje.text
    }));

    this.chatMensajes.update((mensajes) => [...mensajes, { role: 'user', text: prompt }]);
    this.chatPrompt = '';
    this.enviandoChat.set(true);
    this.errorChat.set(null);

    this.api.enviarPreguntaChatbot(prompt, historialPrevio)
      .pipe(finalize(() => this.enviandoChat.set(false)))
      .subscribe({
        next: (respuesta) => {
          this.chatMensajes.update((mensajes) => [
            ...mensajes,
            { role: 'assistant', text: respuesta.response }
          ]);
        },
        error: (error: unknown) => {
          console.error('No fue posible obtener una respuesta del chatbot.', error);
          this.errorChat.set('No se pudo obtener una respuesta. Inténtalo nuevamente.');
        }
      });
  }

  private registrarErrorCarga(mensaje: string, error: unknown): void {
    console.error(mensaje, error);
    this.erroresCarga.update((errores) => [...errores, mensaje]);
  }
}
