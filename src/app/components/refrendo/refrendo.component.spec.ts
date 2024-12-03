import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefrendoComponent } from './refrendo.component';

describe('RefrendoComponent', () => {
  let component: RefrendoComponent;
  let fixture: ComponentFixture<RefrendoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RefrendoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RefrendoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
