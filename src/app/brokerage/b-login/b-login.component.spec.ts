import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BLoginComponent } from './b-login.component';

describe('BLoginComponent', () => {
  let component: BLoginComponent;
  let fixture: ComponentFixture<BLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
