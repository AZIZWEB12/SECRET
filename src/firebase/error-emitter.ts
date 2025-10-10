import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

// Extend EventEmitter typings
interface ErrorEmitter extends EventEmitter {
  emit(event: 'permission-error', error: FirestorePermissionError): boolean;
  on(event: 'permission-error', listener: (error: FirestorePermissionError) => void): this;
}

// Create a new event emitter
const errorEmitter: ErrorEmitter = new EventEmitter();

export { errorEmitter };
