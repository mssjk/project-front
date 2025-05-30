import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDonationComponent } from './viewdonation.component';

describe('ViewdonationComponent', () => {
  let component: ViewDonationComponent;
  let fixture: ComponentFixture<ViewDonationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDonationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDonationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
