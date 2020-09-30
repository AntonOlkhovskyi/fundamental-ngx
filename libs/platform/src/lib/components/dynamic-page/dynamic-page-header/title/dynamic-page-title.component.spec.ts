import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { CLASS_NAME } from '../../constants';
import { DynamicPageTitleComponent } from './dynamic-page-title.component';
import { Component, ViewChild } from '@angular/core';
import { DynamicPageService } from '../../dynamic-page.service';
import { By } from '@angular/platform-browser';
import { PlatformDynamicPageModule } from '../../dynamic-page.module';
import { DynamicPageKeyInfoComponent } from '../key-info/dynamic-page-key-info.component';
import { DynamicPageGlobalActionsComponent } from '../actions/global-actions/dynamic-page-global-actions.component';
import { DynamicPageLayoutActionsComponent } from '../actions/layout-actions/dynamic-page-layout-actions.component';
import { BreadcrumbModule } from '@fundamental-ngx/core';

@Component({
    template: `<fdp-dynamic-page-title [title]="title" [subtitle]="subtitle" [size]="size" [background]="background">
        <fd-breadcrumb>
            <fd-breadcrumb-item>
                <a fd-breadcrumb-link [attr.href]="'#'">Men</a>
            </fd-breadcrumb-item>
            <fd-breadcrumb-item>
                <a fd-breadcrumb-link [attr.href]="'#'">Shoes</a>
            </fd-breadcrumb-item>
        </fd-breadcrumb>

        <fdp-dynamic-page-key-info> </fdp-dynamic-page-key-info>

        <fdp-dynamic-page-global-actions> </fdp-dynamic-page-global-actions>

        <fdp-dynamic-page-layout-actions> </fdp-dynamic-page-layout-actions>
    </fdp-dynamic-page-title>`
})
class TestComponent {
    title = 'Some title ';
    subtitle: string;
    size = 'medium';
    background = '';
    @ViewChild(DynamicPageTitleComponent) dynamicPageTitleComponent: DynamicPageTitleComponent;
    @ViewChild(DynamicPageKeyInfoComponent) dynamicPageKeyInfoComponent: DynamicPageKeyInfoComponent;
    @ViewChild(DynamicPageGlobalActionsComponent) dynamicPageGlobalActionsComponent: DynamicPageGlobalActionsComponent;
    @ViewChild(DynamicPageLayoutActionsComponent) dynamicPageLayoutActionsComponent: DynamicPageLayoutActionsComponent;
}

describe('DynamicPageTitleComponent', () => {
    let fixture: ComponentFixture<TestComponent>;
    let pageTitleComponent: DynamicPageTitleComponent;
    let component: TestComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule, PlatformDynamicPageModule, BreadcrumbModule],
            declarations: [TestComponent],
            providers: [DynamicPageService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        pageTitleComponent = component.dynamicPageTitleComponent;
    });

    it('should create', () => {
        expect(fixture).toBeTruthy();
    });

    it('should add correct classes to host', async () => {
        fixture.detectChanges();
        // expect(fixture.debugElement.classes[CLASS_NAME.dynamicPageTitleArea]).toBeTrue();
        expect(
            pageTitleComponent.elementRef().nativeElement.classList.contains(CLASS_NAME.dynamicPageTitleArea)
        ).toBeTruthy();
    });

    it('should add tabindex to host', async () => {
        fixture.detectChanges();
        expect(pageTitleComponent.elementRef().nativeElement.getAttribute('tabindex')).toEqual('0');
    });

    describe('title text', () => {
        it('should bind to title', () => {
            component.title = 'Sample';
            fixture.detectChanges();
            expect(pageTitleComponent.title).toBe('Sample');
        });

        it('should render it in view', () => {
            component.title = 'Sample';
            fixture.detectChanges();
            const titleElement: HTMLElement = fixture.debugElement.query(By.css('.fd-dynamic-page__title'))
                .nativeElement;
            expect(titleElement?.innerText).toBe('Sample');
        });
    });
    describe('subtitle text', () => {
        it('should bind to title', () => {
            component.subtitle = 'Some subtitle';
            fixture.detectChanges();
            expect(pageTitleComponent.subtitle).toBe('Some subtitle');
        });

        it('should render it in view', () => {
            component.subtitle = 'Some subtitle';
            fixture.detectChanges();
            const titleElement: HTMLElement = fixture.debugElement.query(By.css('.fd-dynamic-page__subtitle'))
                .nativeElement;
            expect(titleElement?.innerText).toBe('Some subtitle');
        });
    });
    describe('page title area', () => {
        it('should set size', async () => {
            const titleElement = fixture.debugElement.query(By.css('.fd-dynamic-page__title-area'));
            expect(titleElement.nativeElement.classList.contains('fd-dynamic-page__title-area--md')).toBeTruthy();
            component.size = 'large';
            fixture.detectChanges();
            expect(titleElement.nativeElement.classList.contains('fd-dynamic-page__title-area--lg')).toBeTruthy();
            component.size = 'small';
            fixture.detectChanges();
            expect(titleElement.nativeElement.classList.contains('fd-dynamic-page__title-area--sm')).toBeTruthy();
        });
        it('should set background styles', async () => {
            const titleElement = fixture.debugElement.query(By.css('.fd-dynamic-page__title-area'));
            component.background = 'transparent';
            fixture.detectChanges();
            expect(
                titleElement.nativeElement.classList.contains('fd-dynamic-page__title-area--transparent-bg')
            ).toBeTruthy();
            component.background = 'solid';
            fixture.detectChanges();
            expect(
                titleElement.nativeElement.classList.contains('fd-dynamic-page__title-area--transparent-bg')
            ).toBeFalsy();
        });
    });
});
