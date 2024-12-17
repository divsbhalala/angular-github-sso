import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgActivityComponent } from './org-activity.component';

describe('OrgActivityComponent', () => {
  let component: OrgActivityComponent;
  let fixture: ComponentFixture<OrgActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
