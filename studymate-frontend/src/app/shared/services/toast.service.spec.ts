import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty messages', () => {
    expect(service.messages()).toEqual([]);
  });

  describe('success', () => {
    it('should add a success toast message', () => {
      service.success('Test success message');

      const messages = service.messages();
      expect(messages.length).toBe(1);
      expect(messages[0].message).toBe('Test success message');
      expect(messages[0].type).toBe('success');
    });

    it('should use custom duration', () => {
      service.success('Test message', 5000);

      const messages = service.messages();
      expect(messages[0].duration).toBe(5000);
    });
  });

  describe('error', () => {
    it('should add an error toast message', () => {
      service.error('Test error message');

      const messages = service.messages();
      expect(messages.length).toBe(1);
      expect(messages[0].message).toBe('Test error message');
      expect(messages[0].type).toBe('error');
    });
  });

  describe('info', () => {
    it('should add an info toast message', () => {
      service.info('Test info message');

      const messages = service.messages();
      expect(messages.length).toBe(1);
      expect(messages[0].message).toBe('Test info message');
      expect(messages[0].type).toBe('info');
    });
  });

  describe('warning', () => {
    it('should add a warning toast message', () => {
      service.warning('Test warning message');

      const messages = service.messages();
      expect(messages.length).toBe(1);
      expect(messages[0].message).toBe('Test warning message');
      expect(messages[0].type).toBe('warning');
    });
  });

  describe('dismiss', () => {
    it('should remove a specific toast by ID', () => {
      service.success('Message 1');
      service.error('Message 2');
      service.info('Message 3');

      const messages = service.messages();
      expect(messages.length).toBe(3);

      const middleToastId = messages[1].id;
      service.dismiss(middleToastId);

      const remainingMessages = service.messages();
      expect(remainingMessages.length).toBe(2);
      expect(remainingMessages.find((m) => m.id === middleToastId)).toBeUndefined();
    });

    it('should do nothing if ID does not exist', () => {
      service.success('Message 1');

      service.dismiss(999);

      expect(service.messages().length).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all toast messages', () => {
      service.success('Message 1');
      service.error('Message 2');
      service.info('Message 3');

      expect(service.messages().length).toBe(3);

      service.clear();

      expect(service.messages().length).toBe(0);
    });
  });

  describe('auto-dismiss', () => {
    it('should auto-dismiss toast after default duration (4000ms)', fakeAsync(() => {
      service.success('Test message');

      expect(service.messages().length).toBe(1);

      tick(4000);

      expect(service.messages().length).toBe(0);
    }));

    it('should auto-dismiss toast after custom duration', fakeAsync(() => {
      service.success('Test message', 2000);

      expect(service.messages().length).toBe(1);

      tick(1999);
      expect(service.messages().length).toBe(1);

      tick(1);
      expect(service.messages().length).toBe(0);
    }));

    it('should auto-dismiss multiple toasts independently', fakeAsync(() => {
      service.success('Message 1', 2000);
      service.error('Message 2', 4000);

      expect(service.messages().length).toBe(2);

      tick(2000);
      expect(service.messages().length).toBe(1);
      expect(service.messages()[0].message).toBe('Message 2');

      tick(2000);
      expect(service.messages().length).toBe(0);
    }));
  });

  describe('message IDs', () => {
    it('should assign unique IDs to each toast', () => {
      service.success('Message 1');
      service.success('Message 2');
      service.success('Message 3');

      const messages = service.messages();
      const ids = messages.map((m) => m.id);

      expect(new Set(ids).size).toBe(3);
    });

    it('should increment IDs sequentially', () => {
      service.success('Message 1');
      service.success('Message 2');

      const messages = service.messages();
      expect(messages[1].id).toBeGreaterThan(messages[0].id);
    });
  });
});
