import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterDafComponent } from './register-daf.component';

describe('RegisterDafComponent', () => {
  let component: RegisterDafComponent;
  let fixture: ComponentFixture<RegisterDafComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterDafComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterDafComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
