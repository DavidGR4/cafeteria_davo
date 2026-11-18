import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface CafeteriaInfo {
  nombre: string;
  etiqueta_ubicacion: string;
  titulo_parte1: string;
  titulo_destacado: string;
  titulo_parte2: string;
  subtitulo_hero: string;
  texto_boton_hero: string;
  video_url: string;
  historia: string;
  filosofia: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  horarios: string;
  foto_tienda_1: string;
  foto_tienda_2: string;
  foto_tienda_3: string;
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  categoria_badge: string;
  horario_o_detalle: string;
  imagen: string;
}

export interface Especialidad {
  id: number;
  nombre: string;
  origen_grano: string;
  notas_cata: string;
  metodo_extraccion: string;
  barista_autor: string;
  descripcion: string;
  imagen: string;
}

export interface ProductoPrecio {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio_bob: number;
  tamanio_presentacion: string;
  destacado: boolean;
  imagen: string;
}

export interface ContactoDatos {
  nombre_completo: string;
  email: string;
  telefono: string;
  motivo_contacto: string;
  fecha_reserva: string;
  cantidad_personas: number;
  mensaje: string;
}

export interface RespuestaChatbot {
  response: string;
}

export interface HistorialChatbot {
  sender: 'user' | 'bot';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  getInfo(): Observable<CafeteriaInfo | undefined> {
    return this.http
      .get<CafeteriaInfo[]>(`${this.apiUrl}/cafeteria-info`)
      .pipe(map((informacion) => informacion[0]));
  }

  getServicios(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.apiUrl}/servicios`);
  }

  getEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.apiUrl}/especialidades`);
  }

  getProductosPrecios(): Observable<ProductoPrecio[]> {
    return this.http.get<ProductoPrecio[]>(`${this.apiUrl}/productos-precios`);
  }

  enviarContacto(datos: ContactoDatos): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/contactos`, datos);
  }

  enviarPreguntaChatbot(
    prompt: string,
    history: HistorialChatbot[] = []
  ): Observable<RespuestaChatbot> {
    return this.http.post<RespuestaChatbot>(`${this.apiUrl}/chatbot`, { prompt, history });
  }
}
