import * as AngularCore from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { WindowRef } from '@spartacus/core';
import { JsonLdScriptFactory } from './json-ld-script.factory';
import { StructuredDataFactory } from './structured-data.factory';

describe('JsonLdScriptFactory', () => {
  let service: JsonLdScriptFactory;
  let winRef: WindowRef;

  describe('server', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          WindowRef,
          { provide: PLATFORM_ID, useValue: 'server' },
          JsonLdScriptFactory,
        ],
      });

      service = TestBed.get(JsonLdScriptFactory);
      winRef = TestBed.get(WindowRef);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should contain script element', () => {
      service.build([{ foo: 'bar-1' }]);
      const scriptElement = winRef.document.getElementById('json-ld');
      expect(scriptElement.innerHTML).toEqual(`[{"foo":"bar-1"}]`);
    });

    it('should contain the given schema in the script element', () => {
      service.build([{ foo: 'bar-2' }]);
      const scriptElement = winRef.document.getElementById('json-ld');
      expect(scriptElement.innerHTML).toEqual(`[{"foo":"bar-2"}]`);
    });
  });

  describe('browser', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          WindowRef,
          { provide: PLATFORM_ID, useValue: 'browser' },
          StructuredDataFactory,
        ],
      });

      service = TestBed.get(StructuredDataFactory);
      winRef = TestBed.get(WindowRef);
    });

    it('should not build in production mode', () => {
      spyOnProperty(AngularCore, 'isDevMode').and.returnValue(() => false);
      service.build([{ foo: 'bar-a' }]);
      const scriptElement = winRef.document.getElementById('json-ld');
      // we might have left over script tag generated in former tests...
      !scriptElement
        ? expect(scriptElement).toBeNull()
        : expect(scriptElement.innerHTML).not.toEqual('[{"foo":"bar-a"}]');
    });

    it('should build the browser in dev mode', () => {
      spyOnProperty(AngularCore, 'isDevMode').and.returnValue(() => true);
      service.build([{ foo: 'bar-b' }]);
      const scriptElement = winRef.document.getElementById('json-ld');
      // we might have left over script tag generated in former tests, so
      // let's explicitely test the innerHTML
      expect(scriptElement.innerHTML).not.toEqual('[{"foo":"bar-b"}]');
    });
  });
});
