import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tributario } from './tributario';

describe('Tributario', () => {
  let component: Tributario;
  let fixture: ComponentFixture<Tributario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tributario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tributario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
