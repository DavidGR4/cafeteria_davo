import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('posts the prompt and previous conversation history to the chatbot', () => {
    const history = [{ sender: 'user' as const, text: 'Hola' }];

    service.enviarPreguntaChatbot('¿Qué recomiendas?', history).subscribe();

    const request = httpTestingController.expectOne('http://localhost:3000/api/chatbot');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ prompt: '¿Qué recomiendas?', history });
    request.flush({ response: 'Prueba.' });
  });
});
