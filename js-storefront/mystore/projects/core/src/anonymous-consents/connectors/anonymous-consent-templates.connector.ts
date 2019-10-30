import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConsentTemplate } from '../../model/consent.model';
import { AnonymousConsentTemplatesAdapter } from './anonymous-consent-templates.adapter';

@Injectable({
  providedIn: 'root',
})
export class AnonymousConsentTemplatesConnector {
  constructor(protected adapter: AnonymousConsentTemplatesAdapter) {}

  loadAnonymousConsentTemplates(): Observable<ConsentTemplate[]> {
    return this.adapter.loadAnonymousConsentTemplates();
  }
}
