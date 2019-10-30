import { Component, Input, Type } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AnonymousConsent,
  AnonymousConsentsConfig,
  AnonymousConsentsService,
  ANONYMOUS_CONSENT_STATUS,
  ConsentTemplate,
  I18nTestingModule,
} from '@spartacus/core';
import { Observable, of } from 'rxjs';
import { ModalService } from '../../modal/index';
import { AnonymousConsentDialogComponent } from './anonymous-consent-dialog.component';

@Component({
  selector: 'cx-icon',
  template: ``,
})
export class MockCxIconComponent {
  @Input() type: string;
}

@Component({
  selector: 'cx-consent-management-form',
  template: ``,
})
export class MockConsentManagementFormComponent {
  @Input()
  consentTemplate: ConsentTemplate;
  @Input()
  requiredConsents: string[] = [];
  @Input()
  isAnonymousConsentsEnabled = false;
  // TODO(issue:4989) Anonymous consents - remove
  @Input()
  isLevel13 = false;
  @Input()
  consent: AnonymousConsent;
}

class MockAnonymousConsentsService {
  getTemplates(): Observable<ConsentTemplate[]> {
    return of();
  }
  getConsents(): Observable<AnonymousConsent[]> {
    return of();
  }
  withdrawConsent(_templateCode: string): void {}
  giveConsent(_templateCode: string): void {}
  isConsentGiven(_consent: AnonymousConsent): boolean {
    return true;
  }
  isConsentWithdrawn(_consent: AnonymousConsent): boolean {
    return true;
  }
}

const mockConfig: AnonymousConsentsConfig = {
  anonymousConsents: { showLegalDescriptionInDialog: true },
};

class MockModalService {
  closeActiveModal(_reason?: any): void {}
}

const mockTemplates: ConsentTemplate[] = [
  { id: 'MARKETING' },
  { id: 'PERSONALIZATION' },
];

describe('AnonymousConsentsDialogComponent', () => {
  let component: AnonymousConsentDialogComponent;
  let fixture: ComponentFixture<AnonymousConsentDialogComponent>;
  let anonymousConsentsService: AnonymousConsentsService;
  let modalService: ModalService;
  let anonymousConsentsConfig: AnonymousConsentsConfig;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [
        AnonymousConsentDialogComponent,
        MockCxIconComponent,
        MockConsentManagementFormComponent,
      ],
      providers: [
        {
          provide: AnonymousConsentsService,
          useClass: MockAnonymousConsentsService,
        },
        {
          provide: ModalService,
          useClass: MockModalService,
        },
        {
          provide: AnonymousConsentsConfig,
          useValue: mockConfig,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnonymousConsentDialogComponent);
    component = fixture.componentInstance;
    anonymousConsentsService = TestBed.get(AnonymousConsentsService as Type<
      AnonymousConsentsService
    >);
    modalService = TestBed.get(ModalService as Type<ModalService>);
    anonymousConsentsConfig = TestBed.get(AnonymousConsentsConfig as Type<
      AnonymousConsentsConfig
    >);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set templates$ and consents$', () => {
      spyOn(anonymousConsentsService, 'getTemplates').and.stub();
      spyOn(anonymousConsentsService, 'getConsents').and.stub();

      component.ngOnInit();
      expect(anonymousConsentsService.getTemplates).toHaveBeenCalled();
      expect(anonymousConsentsService.getConsents).toHaveBeenCalled();
    });
  });

  describe('closeModal', () => {
    it('should call modalService.closeActiveModal', () => {
      spyOn(modalService, 'closeActiveModal').and.stub();
      component.closeModal('xxx');
      expect(modalService.closeActiveModal).toHaveBeenCalledWith('xxx');
    });
  });

  describe('rejectAll', () => {
    const mockConsent: AnonymousConsent[] = [
      {
        templateCode: mockTemplates[0].id,
        consentState: ANONYMOUS_CONSENT_STATUS.GIVEN,
      },
      {
        templateCode: mockTemplates[1].id,
        consentState: ANONYMOUS_CONSENT_STATUS.GIVEN,
      },
    ];
    describe('when a required consent is present', () => {
      it('should skip it', () => {
        anonymousConsentsConfig.anonymousConsents.requiredConsents = [
          mockTemplates[0].id,
        ];
        spyOn(component, 'closeModal').and.stub();
        spyOn<any>(component['subscriptions'], 'add').and.callThrough();
        spyOn(anonymousConsentsService, 'isConsentGiven').and.returnValues(
          true,
          true
        );
        spyOn(anonymousConsentsService, 'withdrawConsent').and.stub();

        component.templates$ = of(mockTemplates);
        component.consents$ = of(mockConsent);
        component.rejectAll();

        expect(anonymousConsentsService.withdrawConsent).toHaveBeenCalledTimes(
          1
        );
        expect(component.closeModal).toHaveBeenCalledWith('rejectAll');
        expect(component['subscriptions'].add).toHaveBeenCalled();
      });
    });
    describe('when no required consent is present', () => {
      it('should call withdrawAllConsents and close the modal dialog', () => {
        spyOn(component, 'closeModal').and.stub();
        spyOn<any>(component['subscriptions'], 'add').and.callThrough();
        spyOn(anonymousConsentsService, 'isConsentGiven').and.returnValues(
          true,
          true
        );
        spyOn(anonymousConsentsService, 'withdrawConsent').and.stub();

        component.templates$ = of(mockTemplates);
        component.consents$ = of(mockConsent);
        component.rejectAll();

        expect(anonymousConsentsService.withdrawConsent).toHaveBeenCalledTimes(
          mockTemplates.length
        );
        expect(component.closeModal).toHaveBeenCalledWith('rejectAll');
        expect(component['subscriptions'].add).toHaveBeenCalled();
      });
    });
  });

  describe('allowAll', () => {
    const mockConsents: AnonymousConsent[] = [
      {
        templateCode: mockTemplates[0].id,
        consentState: ANONYMOUS_CONSENT_STATUS.WITHDRAWN,
      },
      {
        templateCode: mockTemplates[1].id,
        consentState: ANONYMOUS_CONSENT_STATUS.WITHDRAWN,
      },
    ];
    describe('when a required consent is present', () => {
      it('should skip it', () => {
        anonymousConsentsConfig.anonymousConsents.requiredConsents = [
          mockTemplates[0].id,
        ];
        spyOn(component, 'closeModal').and.stub();
        spyOn<any>(component['subscriptions'], 'add').and.callThrough();
        spyOn(anonymousConsentsService, 'isConsentWithdrawn').and.returnValues(
          true,
          true
        );
        spyOn(anonymousConsentsService, 'giveConsent').and.stub();

        component.templates$ = of(mockTemplates);
        component.consents$ = of(mockConsents);
        component.allowAll();

        expect(anonymousConsentsService.giveConsent).toHaveBeenCalledTimes(1);
        expect(component.closeModal).toHaveBeenCalledWith('allowAll');
        expect(component['subscriptions'].add).toHaveBeenCalled();
      });
    });
    describe('when no required consent is present', () => {
      it('should call giveConsent for each consent and close the modal dialog', () => {
        spyOn(component, 'closeModal').and.stub();
        spyOn<any>(component['subscriptions'], 'add').and.callThrough();
        spyOn(anonymousConsentsService, 'isConsentWithdrawn').and.returnValues(
          true,
          true
        );
        spyOn(anonymousConsentsService, 'giveConsent').and.stub();

        component.templates$ = of(mockTemplates);
        component.consents$ = of(mockConsents);
        component.allowAll();

        expect(anonymousConsentsService.giveConsent).toHaveBeenCalledTimes(
          mockTemplates.length
        );
        expect(component.closeModal).toHaveBeenCalledWith('allowAll');
        expect(component['subscriptions'].add).toHaveBeenCalled();
      });
    });
    describe('when the consents have null state', () => {
      it('should be able to give consents and close the dialog', () => {
        const nullStateMockConsents: AnonymousConsent[] = [
          {
            templateCode: mockTemplates[0].id,
            consentState: null,
          },
          {
            templateCode: mockTemplates[1].id,
            consentState: null,
          },
        ];

        spyOn(component, 'closeModal').and.stub();
        spyOn<any>(component['subscriptions'], 'add').and.callThrough();
        spyOn(anonymousConsentsService, 'isConsentWithdrawn').and.returnValues(
          true,
          true
        );
        spyOn(anonymousConsentsService, 'giveConsent').and.stub();

        component.templates$ = of(mockTemplates);
        component.consents$ = of(nullStateMockConsents);
        component.allowAll();

        expect(anonymousConsentsService.giveConsent).toHaveBeenCalledTimes(
          mockTemplates.length
        );
        expect(component.closeModal).toHaveBeenCalledWith('allowAll');
        expect(component['subscriptions'].add).toHaveBeenCalled();
      });
    });
  });

  const isRequiredConsentMethod = 'isRequiredConsent';
  describe(isRequiredConsentMethod, () => {
    describe('when the requiredConsents is NOT configured', () => {
      it('should return false', () => {
        anonymousConsentsConfig.anonymousConsents.requiredConsents = undefined;
        const result = component[isRequiredConsentMethod](mockTemplates[0]);
        expect(result).toEqual(false);
      });
    });
    describe('when the requiredConsents is configured', () => {
      it('should return true', () => {
        anonymousConsentsConfig.anonymousConsents.requiredConsents = [
          mockTemplates[0].id,
        ];
        const result = component[isRequiredConsentMethod](mockTemplates[0]);
        expect(result).toEqual(true);
      });
    });
  });

  describe('onConsentChange', () => {
    describe('when the consent was given', () => {
      it('should call giveConsent', () => {
        spyOn(anonymousConsentsService, 'giveConsent').and.stub();
        component.onConsentChange({ given: true, template: mockTemplates[0] });
        expect(anonymousConsentsService.giveConsent).toHaveBeenCalledWith(
          mockTemplates[0].id
        );
      });
    });
    describe('when the consent was withdrawn', () => {
      it('should call withdrawConsent', () => {
        spyOn(anonymousConsentsService, 'withdrawConsent').and.stub();
        component.onConsentChange({ given: false, template: mockTemplates[0] });
        expect(anonymousConsentsService.withdrawConsent).toHaveBeenCalledWith(
          mockTemplates[0].id
        );
      });
    });
  });

  describe('getCorrespondingConsent', () => {
    it('should return null if no consent matches the provided template', () => {
      expect(component.getCorrespondingConsent(mockTemplates[0], [])).toEqual(
        null
      );
    });
    it('should return the corresponding consent', () => {
      const mockConsents: AnonymousConsent[] = [
        { templateCode: 'XXX' },
        { templateCode: 'MARKETING' },
      ];
      expect(
        component.getCorrespondingConsent(mockTemplates[0], mockConsents)
      ).toEqual(mockConsents[1]);
    });
  });

  describe('ngOnDestroy', () => {
    it('should call unsubscribe', () => {
      spyOn<any>(component['subscriptions'], 'unsubscribe').and.stub();
      component.ngOnDestroy();
      expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
    });
  });
});
