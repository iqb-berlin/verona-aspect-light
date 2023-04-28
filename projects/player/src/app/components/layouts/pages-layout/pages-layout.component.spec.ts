import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { FlexModule } from '@angular/flex-layout';
import { PagesLayoutComponent } from './pages-layout.component';

describe('PagesLayoutComponent', () => {
  let component: PagesLayoutComponent;
  let fixture: ComponentFixture<PagesLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PagesLayoutComponent],
      imports: [FlexModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesLayoutComponent);
    component = fixture.componentInstance;
    component.selectIndex = new Subject<number>();
    component.scrollPages = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
