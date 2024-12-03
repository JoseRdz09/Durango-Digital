import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestexcelComponent } from './gestexcel.component';

describe('GestexcelComponent', () => {
  let component: GestexcelComponent;
  let fixture: ComponentFixture<GestexcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestexcelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestexcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
