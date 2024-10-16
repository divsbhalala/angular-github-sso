import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OAuthComponent } from './oauth.component';

describe('OAuthComponent', () => {
  let component: OAuthComponent;
  let fixture: ComponentFixture<OAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OAuthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
