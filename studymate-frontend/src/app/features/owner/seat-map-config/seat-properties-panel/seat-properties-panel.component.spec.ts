import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SeatPropertiesPanelComponent } from './seat-properties-panel.component';
import { Seat } from '../../../../core/models/seat-config.model';

describe('SeatPropertiesPanelComponent', () => {
  let component: SeatPropertiesPanelComponent;
  let fixture: ComponentFixture<SeatPropertiesPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatPropertiesPanelComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SeatPropertiesPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with default values', () => {
      expect(component.propertiesForm).toBeDefined();
      expect(component.propertiesForm.get('seatNumber')).toBeDefined();
      expect(component.propertiesForm.get('spaceType')).toBeDefined();
      expect(component.propertiesForm.get('customPrice')).toBeDefined();
      expect(component.propertiesForm.get('isLadiesOnly')).toBeDefined();
    });

    it('should have seat number field disabled', () => {
      expect(component.propertiesForm.get('seatNumber')?.disabled).toBe(true);
    });

    it('should have space type field with Cabin as default', () => {
      expect(component.propertiesForm.get('spaceType')?.value).toBe('Cabin');
    });

    it('should have all 6 space type options', () => {
      expect(component.spaceTypes.length).toBe(6);
      expect(component.spaceTypes).toContain('Cabin');
      expect(component.spaceTypes).toContain('Seat Row');
      expect(component.spaceTypes).toContain('4-Person Table');
      expect(component.spaceTypes).toContain('Study Pod');
      expect(component.spaceTypes).toContain('Meeting Room');
      expect(component.spaceTypes).toContain('Lounge Area');
    });
  });

  describe('Input Changes (ngOnChanges)', () => {
    it('should update form when seat input changes', () => {
      const testSeat: Seat = {
        seatNumber: 'A1',
        xCoord: 100,
        yCoord: 150,
        spaceType: 'Study Pod',
        customPrice: 500,
      };

      component.seat = testSeat;
      component.ngOnChanges();

      expect(component.propertiesForm.get('seatNumber')?.value).toBe('A1');
      expect(component.propertiesForm.get('spaceType')?.value).toBe('Study Pod');
      expect(component.propertiesForm.get('customPrice')?.value).toBe(500);
    });

    it('should default to Cabin if seat has no space type', () => {
      const testSeat: Seat = {
        seatNumber: 'B2',
        xCoord: 200,
        yCoord: 250,
      };

      component.seat = testSeat;
      component.ngOnChanges();

      expect(component.propertiesForm.get('spaceType')?.value).toBe('Cabin');
    });

    it('should set null for custom price if not provided', () => {
      const testSeat: Seat = {
        seatNumber: 'C3',
        xCoord: 300,
        yCoord: 350,
        spaceType: 'Meeting Room',
      };

      component.seat = testSeat;
      component.ngOnChanges();

      expect(component.propertiesForm.get('customPrice')?.value).toBeNull();
    });
  });

  describe('Custom Price Validation', () => {
    beforeEach(() => {
      const testSeat: Seat = {
        seatNumber: 'A1',
        xCoord: 100,
        yCoord: 150,
      };
      component.seat = testSeat;
      component.ngOnChanges();
    });

    it('should accept valid price within range (50-1000)', () => {
      const customPriceControl = component.propertiesForm.get('customPrice');

      customPriceControl?.setValue(200);
      expect(customPriceControl?.valid).toBe(true);

      customPriceControl?.setValue(50);
      expect(customPriceControl?.valid).toBe(true);

      customPriceControl?.setValue(1000);
      expect(customPriceControl?.valid).toBe(true);
    });

    it('should reject price below minimum (50)', () => {
      const customPriceControl = component.propertiesForm.get('customPrice');

      customPriceControl?.setValue(49);
      expect(customPriceControl?.hasError('min')).toBe(true);
      expect(component.customPriceError).toBe('Price must be at least ₹50');
    });

    it('should reject price above maximum (1000)', () => {
      const customPriceControl = component.propertiesForm.get('customPrice');

      customPriceControl?.setValue(1001);
      expect(customPriceControl?.hasError('max')).toBe(true);
      expect(component.customPriceError).toBe('Price cannot exceed ₹1000');
    });

    it('should accept null custom price (optional field)', () => {
      const customPriceControl = component.propertiesForm.get('customPrice');

      customPriceControl?.setValue(null);
      expect(customPriceControl?.valid).toBe(true);
    });
  });

  describe('Save Properties', () => {
    let testSeat: Seat;

    beforeEach(() => {
      testSeat = {
        seatNumber: 'A1',
        xCoord: 100,
        yCoord: 150,
        spaceType: 'Cabin',
      };
      component.seat = testSeat;
      component.ngOnChanges();
    });

    it('should emit saveProperties event with updated seat on valid save', () => {
      spyOn(component.saveProperties, 'emit');

      component.propertiesForm.patchValue({
        spaceType: 'Study Pod',
        customPrice: 750,
      });

      component.onSave();

      expect(component.saveProperties.emit).toHaveBeenCalledWith({
        ...testSeat,
        spaceType: 'Study Pod',
        customPrice: 750,
        isLadiesOnly: false,
      });
    });

    it('should not emit if form is invalid', () => {
      spyOn(component.saveProperties, 'emit');

      component.propertiesForm.patchValue({
        customPrice: 5000, // Invalid - exceeds max
      });

      component.onSave();

      expect(component.saveProperties.emit).not.toHaveBeenCalled();
      expect(component.errorMessage()).toBe('Please fix validation errors');
    });

    it('should not emit if no seat is selected', () => {
      spyOn(component.saveProperties, 'emit');
      component.seat = null;

      component.onSave();

      expect(component.saveProperties.emit).not.toHaveBeenCalled();
      expect(component.errorMessage()).toBe('No seat selected');
    });

    it('should clear error message on successful save', () => {
      spyOn(component.saveProperties, 'emit');
      component.errorMessage.set('Previous error');

      component.onSave();

      expect(component.errorMessage()).toBeNull();
    });

    it('should emit undefined for customPrice if empty', () => {
      spyOn(component.saveProperties, 'emit');

      component.propertiesForm.patchValue({
        spaceType: 'Lounge Area',
        customPrice: null,
      });

      component.onSave();

      const emittedSeat = (component.saveProperties.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedSeat.customPrice).toBeUndefined();
    });
  });

  describe('Cancel', () => {
    it('should emit cancel event', () => {
      spyOn(component.cancel, 'emit');

      component.onCancel();

      expect(component.cancel.emit).toHaveBeenCalled();
    });

    it('should clear error message on cancel', () => {
      component.errorMessage.set('Test error');

      component.onCancel();

      expect(component.errorMessage()).toBeNull();
    });
  });

  describe('Space Type Selection', () => {
    beforeEach(() => {
      const testSeat: Seat = {
        seatNumber: 'A1',
        xCoord: 100,
        yCoord: 150,
      };
      component.seat = testSeat;
      component.ngOnChanges();
    });

    it('should allow changing space type to any of the 6 options', () => {
      const spaceTypeControl = component.propertiesForm.get('spaceType');

      component.spaceTypes.forEach((type) => {
        spaceTypeControl?.setValue(type);
        expect(spaceTypeControl?.value).toBe(type);
        expect(spaceTypeControl?.valid).toBe(true);
      });
    });

    it('should require space type selection', () => {
      const spaceTypeControl = component.propertiesForm.get('spaceType');

      spaceTypeControl?.setValue('');
      expect(spaceTypeControl?.hasError('required')).toBe(true);
    });
  });

  describe('Ladies-Only Functionality (Story 1.4.1)', () => {
    beforeEach(() => {
      const testSeat: Seat = {
        seatNumber: 'A1',
        xCoord: 100,
        yCoord: 150,
      };
      component.seat = testSeat;
      component.ngOnChanges();
    });

    it('should initialize isLadiesOnly field with false as default', () => {
      const isLadiesOnlyControl = component.propertiesForm.get('isLadiesOnly');
      expect(isLadiesOnlyControl).toBeDefined();
      expect(isLadiesOnlyControl?.value).toBe(false);
    });

    it('should render ladies-only checkbox in the template', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const checkbox = compiled.querySelector('input[type="checkbox"][formControlName="isLadiesOnly"]');
      expect(checkbox).toBeTruthy();
      expect(checkbox.id).toBe('ladiesOnly');
    });

    it('should display correct label and help text for ladies-only checkbox', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const label = compiled.querySelector('label[for="ladiesOnly"]');
      const helpText = compiled.querySelector('label[for="ladiesOnly"]').parentElement.querySelector('p');

      expect(label?.textContent?.trim()).toContain('Ladies Only Seat');
      expect(helpText?.textContent?.trim()).toBe('Only female users can book this seat');
    });

    it('should update form state when ladies-only checkbox is checked', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const checkbox = compiled.querySelector('input[type="checkbox"][formControlName="isLadiesOnly"]');
      const isLadiesOnlyControl = component.propertiesForm.get('isLadiesOnly');

      // Initially unchecked
      expect(isLadiesOnlyControl?.value).toBe(false);

      // Check the checkbox
      checkbox.click();
      fixture.detectChanges();

      expect(isLadiesOnlyControl?.value).toBe(true);
    });

    it('should populate isLadiesOnly field when seat has isLadiesOnly=true', () => {
      const ladiesOnlySeat: Seat = {
        seatNumber: 'B2',
        xCoord: 200,
        yCoord: 250,
        isLadiesOnly: true,
      };

      component.seat = ladiesOnlySeat;
      component.ngOnChanges();

      expect(component.propertiesForm.get('isLadiesOnly')?.value).toBe(true);
    });

    it('should populate isLadiesOnly field as false when seat has isLadiesOnly=false', () => {
      const regularSeat: Seat = {
        seatNumber: 'C3',
        xCoord: 300,
        yCoord: 350,
        isLadiesOnly: false,
      };

      component.seat = regularSeat;
      component.ngOnChanges();

      expect(component.propertiesForm.get('isLadiesOnly')?.value).toBe(false);
    });

    it('should default isLadiesOnly to false when seat does not have isLadiesOnly field', () => {
      const seatWithoutLadiesOnly: Seat = {
        seatNumber: 'D4',
        xCoord: 400,
        yCoord: 450,
      };

      component.seat = seatWithoutLadiesOnly;
      component.ngOnChanges();

      expect(component.propertiesForm.get('isLadiesOnly')?.value).toBe(false);
    });

    it('should include isLadiesOnly in saved seat object when checked', () => {
      spyOn(component.saveProperties, 'emit');

      component.propertiesForm.patchValue({
        isLadiesOnly: true,
        spaceType: 'Cabin',
      });

      component.onSave();

      const emittedSeat = (component.saveProperties.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedSeat.isLadiesOnly).toBe(true);
    });

    it('should include isLadiesOnly=false in saved seat object when unchecked', () => {
      spyOn(component.saveProperties, 'emit');

      component.propertiesForm.patchValue({
        isLadiesOnly: false,
        spaceType: 'Study Pod',
      });

      component.onSave();

      const emittedSeat = (component.saveProperties.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedSeat.isLadiesOnly).toBe(false);
    });

    it('should save ladies-only seat with custom price', () => {
      spyOn(component.saveProperties, 'emit');

      component.propertiesForm.patchValue({
        isLadiesOnly: true,
        spaceType: 'Seat Row',
        customPrice: 750,
      });

      component.onSave();

      const emittedSeat = (component.saveProperties.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedSeat.isLadiesOnly).toBe(true);
      expect(emittedSeat.customPrice).toBe(750);
      expect(emittedSeat.spaceType).toBe('Seat Row');
    });

    it('should display pink-themed styling for ladies-only checkbox container', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const checkbox = compiled.querySelector('input[type="checkbox"][formControlName="isLadiesOnly"]');
      const container = checkbox?.closest('.bg-pink-50');

      expect(container).toBeTruthy();
      expect(container?.classList.contains('border-pink-200')).toBe(true);
    });

    it('should have pink-themed checkbox styling classes', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const checkbox = compiled.querySelector('input[type="checkbox"][formControlName="isLadiesOnly"]');

      expect(checkbox?.classList.contains('text-pink-600')).toBe(true);
    });
  });

  describe('Component Integration', () => {
    it('should render form when seat is provided', () => {
      const testSeat: Seat = {
        seatNumber: 'A1',
        xCoord: 100,
        yCoord: 150,
        spaceType: 'Cabin',
      };

      component.seat = testSeat;
      component.ngOnChanges();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('form')).toBeTruthy();
      expect(compiled.querySelector('select[formControlName="spaceType"]')).toBeTruthy();
      expect(compiled.querySelector('input[formControlName="customPrice"]')).toBeTruthy();
    });

    it('should display save and cancel buttons', () => {
      const testSeat: Seat = {
        seatNumber: 'A1',
        xCoord: 100,
        yCoord: 150,
      };

      component.seat = testSeat;
      component.ngOnChanges();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });
});
