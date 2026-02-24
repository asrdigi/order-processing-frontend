import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersAdmin } from './customers-admin';

describe('CustomersAdmin', () => {
  let component: CustomersAdmin;
  let fixture: ComponentFixture<CustomersAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
