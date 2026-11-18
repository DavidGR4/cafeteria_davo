import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { App } from './app';
import { ApiService, HistorialChatbot } from './services/api.service';

describe('App', () => {
  const apiService = {
    getInfo: () => of({
      nombre: 'CoffeeHouse',
      etiqueta_ubicacion: 'COCHABAMBA · BOLIVIA',
      titulo_parte1: 'El',
      titulo_destacado: 'Mejor',
      titulo_parte2: 'Café de la Ciudad',
      subtitulo_hero: 'Café de especialidad',
      texto_boton_hero: 'EXPLORAR MENÚ',
      video_url: '',
      historia: '',
      filosofia: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      email: '',
      horarios: '',
      foto_tienda_1: '',
      foto_tienda_2: '',
      foto_tienda_3: ''
    }),
    getServicios: () => of([]),
    getEspecialidades: () => of([]),
    getProductosPrecios: () => of([]),
    enviarContacto: () => of({}),
    enviarPreguntaChatbot: vi.fn(
      (_prompt: string, _history: HistorialChatbot[]) => of({ response: '' })
    )
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: ApiService, useValue: apiService }]
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render cafe information from the API', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('CoffeeHouse');
    expect(compiled.querySelector('h1')?.textContent).toContain('Mejor');
    expect(compiled.querySelector('.hero .button')?.textContent).toContain('EXPLORAR MENÚ');
  });

  it('should send earlier chat messages as history', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.chatMensajes.set([
      { role: 'user', text: '¿Qué cafés tienen?' },
      { role: 'assistant', text: 'Tenemos espresso y filtrados.' }
    ]);
    app.chatPrompt = '¿Cuál recomiendas?';

    app.enviarPreguntaChatbot();

    expect(apiService.enviarPreguntaChatbot).toHaveBeenCalledWith('¿Cuál recomiendas?', [
      { sender: 'user', text: '¿Qué cafés tienen?' },
      { sender: 'bot', text: 'Tenemos espresso y filtrados.' }
    ]);
  });
});
